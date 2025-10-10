#!/usr/bin/env node
/**
 * Walk a source directory (e.g., ./cdn), compute SHA-256 for files under
 * /certs and /tests, and produce a manifest JSON.
 *
 * Usage:
 *   node scripts/hash-certificates.js --source ./cdn --base-url https://cdn.flyingcircuscoffee.com --out ./proofs/fcc_cert_manifest.json
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function arg(name, def = undefined) {
  const idx = process.argv.indexOf(name);
  return idx >= 0 ? process.argv[idx + 1] : def;
}

const SOURCE = arg('--source', './cdn');
const OUT = arg('--out', './proofs/fcc_cert_manifest.json');
const BASE_URL = arg('--base-url', ''); // e.g., https://cdn.flyingcircuscoffee.com

function* walk(dir) {
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const d of list) {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) yield* walk(p);
    else yield p;
  }
}

function sha256File(filePath) {
  const hash = crypto.createHash('sha256');
  const data = fs.readFileSync(filePath);
  hash.update(data);
  return { sha256: hash.digest('hex'), size: data.length };
}

function toCdnUrl(filePath) {
  if (!BASE_URL) return null;
  const rel = path.relative(SOURCE, filePath).replace(/\\/g, '/');
  return `${BASE_URL.replace(/\/$/, '')}/${rel}`;
}

function buildManifest() {
  const root = path.resolve(SOURCE);
  const certDir = path.join(root, 'certs');
  const testDir = path.join(root, 'tests');

  const entries = [];

  for (const dir of [certDir, testDir]) {
    if (!fs.existsSync(dir)) continue;
    for (const file of walk(dir)) {
      const stat = fs.statSync(file);
      if (!stat.isFile()) continue;
      const { sha256, size } = sha256File(file);
      entries.push({
        path: path.relative(root, file).replace(/\\/g, '/'),
        url: toCdnUrl(file),
        sha256,
        size,
        modified: new Date(stat.mtimeMs).toISOString(),
      });
    }
  }

  const manifest = {
    issuer: 'Flying Circus Coffee',
    generatedAt: new Date().toISOString(),
    baseUrl: BASE_URL || undefined,
    entries,
  };
  return manifest;
}

function main() {
  const manifest = buildManifest();
  const outPath = path.resolve(OUT);
  const outDir = path.dirname(outPath);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2));
  console.log(`Wrote manifest: ${outPath}`);
  console.log(`Entries: ${manifest.entries.length}`);
}

if (require.main === module) main();
