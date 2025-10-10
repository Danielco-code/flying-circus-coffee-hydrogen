// Admin endpoint to rebuild + resign manifest and optionally anchor via OpenTimestamps.
// Protect with ADMIN_TOKEN env. POST only.
import type { ActionFunctionArgs } from "@shopify/remix-oxygen";
import { json } from "@remix-run/node";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const pExecFile = promisify(execFile);

export async function action({ request, context }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json({ ok: false, error: "Method Not Allowed" }, { status: 405 });
  }

  const auth = request.headers.get("authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "");
  const ADMIN_TOKEN = context.env?.ADMIN_TOKEN;
  if (!ADMIN_TOKEN || token !== ADMIN_TOKEN) {
    return json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const CERT_SOURCE_DIR = context.env?.CERT_SOURCE_DIR || "./cdn";
  const CERT_BASE_URL = context.env?.CERT_BASE_URL || "";
  const MANIFEST_OUT = context.env?.MANIFEST_OUT || "./proofs/fcc_cert_manifest.json";
  const SIG_OUT = context.env?.SIG_OUT || "./proofs/fcc_cert_manifest.sig";
  const PRIVATE_KEY_PATH = context.env?.PRIVATE_KEY_PATH || "./secrets/fcc_signing_key.pem";
  const OTS_ENABLED = (context.env?.OTS_ENABLED || "1") === "1";

  try {
    // 1) Hash certificates -> manifest
    const hashArgs = [
      "scripts/hash-certificates.js",
      "--source", CERT_SOURCE_DIR,
      "--out", MANIFEST_OUT,
    ];
    if (CERT_BASE_URL) hashArgs.push("--base-url", CERT_BASE_URL);
    await pExecFile("node", hashArgs, { timeout: 120000 });

    // 2) Sign manifest
    await pExecFile("node", [
      "scripts/sign-manifest.js",
      "--manifest", MANIFEST_OUT,
      "--private", PRIVATE_KEY_PATH,
      "--out", SIG_OUT,
    ], { timeout: 120000 });

    // 3) Optional: OpenTimestamps
    let ots = { attempted: false, ok: false, message: "OTS skipped" };
    if (OTS_ENABLED) {
      ots.attempted = true;
      try {
        const { stdout, stderr } = await pExecFile("node", ["scripts/ots-stamp.js", "--file", MANIFEST_OUT], { timeout: 120000 });
        ots.ok = true;
        ots.message = (stdout || "").trim() || "OTS stamp ok";
      } catch (e: any) {
        ots.ok = false;
        ots.message = e?.message || "OTS failed";
      }
    }

    return json({
      ok: true,
      manifestPath: MANIFEST_OUT,
      signaturePath: SIG_OUT,
      ots,
      auditedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return json({ ok: false, error: error?.message || String(error) }, { status: 500 });
  }
}

export async function loader() {
  return json({ ok: false, error: "Use POST" }, { status: 405 });
}
