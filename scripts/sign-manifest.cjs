#!/usr/bin/env node
/**
 * Sign a manifest JSON with an Ed25519 private key (PEM).
 *
 * Usage:
 *   node scripts/sign-manifest.js --manifest ./proofs/fcc_cert_manifest.json --private ./secrets/fcc_signing_key.pem --out ./proofs/fcc_cert_manifest.sig
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function arg(name, def = undefined) {
  const idx = process.argv.indexOf(name);
  return idx >= 0 ? process.argv[idx + 1] : def;
}

const MANIFEST = arg('--manifest');
const PRIV = arg('--private');
const OUT = arg('--out', './proofs/fcc_cert_manifest.sig');

if (!MANIFEST || !PRIV) {
  console.error('Usage: --manifest <file> --private <pem> [--out <sigfile>]');
  process.exit(1);
}

function main() {
  const manifest = fs.readFileSync(MANIFEST);
  const privateKey = fs.readFileSync(PRIV);

  const signature = crypto.sign(null, Buffer.from(manifest), {
    key: privateKey.toString(),
  });

  const outPath = path.resolve(OUT);
  const outDir = path.dirname(outPath);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outPath, signature.toString('base64'));
  console.log(`Signature written: ${outPath}`);
}

if (require.main === module) main();
