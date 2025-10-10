#!/usr/bin/env node
/**
 * Verify a signed manifest; optional re-hash files listed in the manifest.
 *
 * Usage:
 *   node scripts/verify-proof.js --manifest ./proofs/fcc_cert_manifest.json --public ./proofs/fcc_public.pem --sig ./proofs/fcc_cert_manifest.sig [--rehash] [--source ./cdn]
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function arg(name, def = undefined) {
  const idx = process.argv.indexOf(name);
  return idx >= 0 ? process.argv[idx + 1] : def;
}

const MANIFEST = arg('--manifest');
const PUB = arg('--public');
const SIG = arg('--sig');
const REHASH = process.argv.includes('--rehash');
const SOURCE = arg('--source', './cdn');

if (!MANIFEST || !PUB || !SIG) {
  console.error('Usage: --manifest <file> --public <pem> --sig <sigfile> [--rehash] [--source <dir>]');
  process.exit(1);
}

function verifySignature(manifestBuf, publicPem, sigB64) {
  const ok = crypto.verify(null, manifestBuf, { key: publicPem.toString() }, Buffer.from(sigB64, 'base64'));
  return ok;
}

function sha256File(filePath) {
  const hash = crypto.createHash('sha256');
  const data = fs.readFileSync(filePath);
  hash.update(data);
  return hash.digest('hex');
}

function main() {
  const manifestBuf = fs.readFileSync(MANIFEST);
  const publicPem = fs.readFileSync(PUB);
  const sigB64 = fs.readFileSync(SIG, 'utf8').trim();

  const ok = verifySignature(manifestBuf, publicPem, sigB64);
  console.log(`Signature valid: ${ok}`);
  if (!ok) process.exit(2);

  if (REHASH) {
    const manifest = JSON.parse(manifestBuf.toString());
    let mismatches = 0;
    for (const entry of manifest.entries || []) {
      const localPath = path.join(SOURCE, entry.path);
      if (!fs.existsSync(localPath)) {
        console.warn(`Missing local file: ${localPath}`);
        continue;
        }
      const actual = sha256File(localPath);
      if (actual !== entry.sha256) {
        console.error(`Hash mismatch: ${entry.path}\n expected ${entry.sha256}\n actual   ${actual}`);
        mismatches++;
      }
    }
    if (mismatches === 0) console.log('All hashes match.');
    else {
      console.error(`Mismatches: ${mismatches}`);
      process.exit(3);
    }
  }
}

if (require.main === module) main();
