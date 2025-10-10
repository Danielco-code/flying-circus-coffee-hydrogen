#!/usr/bin/env node
/**
 * Attempt to OpenTimestamp a file using the `ots` CLI if available.
 * Usage: node scripts/ots-stamp.js --file ./proofs/fcc_cert_manifest.json
 */
const { execFileSync } = require("child_process");

function arg(name, def) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : def;
}

const FILE = arg("--file");
if (!FILE) {
  console.error("Usage: --file <path>");
  process.exit(1);
}

function which(bin) {
  try {
    const out = execFileSync(process.platform === "win32" ? "where" : "which", [bin], { stdio: ["ignore", "pipe", "pipe"] });
    return out.toString().trim();
  } catch {
    return null;
  }
}

const otsPath = which("ots");
if (!otsPath) {
  console.warn("OpenTimestamps CLI `ots` not found in PATH. Skipping anchoring.");
  process.exit(0);
}

try {
  execFileSync(otsPath, ["stamp", FILE], { stdio: ["ignore", "pipe", "pipe"] });
  console.log("OpenTimestamped successfully.");
} catch (e) {
  console.warn("OpenTimestamps stamping failed (continuing): " + (e?.message || e));
  process.exit(0);
}
