// Admin-only button to trigger /admin/proofs/rebuild
import { useState } from "react";

export function AdminRebuildButton({ adminToken }: { adminToken: string }) {
  const [status, setStatus] = useState<"idle"|"running"|"ok"|"error">("idle");
  const [message, setMessage] = useState<string>("");

  async function run() {
    setStatus("running");
    setMessage("");
    try {
      const res = await fetch("/admin/proofs/rebuild", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${adminToken}`,
        },
      });
      const data = await res.json();
      if (data.ok) {
        setStatus("ok");
        setMessage(`Rebuilt at ${data.auditedAt}. OTS: ${data.ots?.message || "n/a"}`);
      } else {
        setStatus("error");
        setMessage(data.error || "Unknown error");
      }
    } catch (e: any) {
      setStatus("error");
      setMessage(e?.message || "Network error");
    }
  }

  return (
    <div className="rounded-xl border border-zinc-200 p-4">
      <div className="text-sm mb-2 font-medium">Certification Proofs</div>
      <button
        onClick={run}
        className="text-sm bg-zinc-900 text-white px-3 py-2 rounded hover:bg-zinc-800 disabled:opacity-50"
        disabled={status==="running"}
      >
        {status==="running" ? "Rebuilding…" : "Rebuild & Sign Manifest"}
      </button>
      {message && <div className="mt-2 text-xs text-zinc-700">{message}</div>}
      {status==="ok" && <div className="mt-1 text-green-700 text-xs">✅ Done</div>}
      {status==="error" && <div className="mt-1 text-red-700 text-xs">⚠️ Failed</div>}
    </div>
  );
}
