// app/oxygen-shim.js
// Used to patch missing Node modules inside Oxygen

if (!globalThis.__patchedOxygen__) {
  globalThis.__patchedOxygen__ = true;

  // Patch @remix-run/node
  try {
    globalThis["@remix-run/node"] = {
      json: (data, init = {}) =>
        new Response(JSON.stringify(data), {
          headers: { "Content-Type": "application/json", ...init.headers },
          status: init.status || 200,
        }),
      redirect: (url, init = 302) => Response.redirect(url, init),
    };
  } catch (_) {}

  // Patch built-in node modules that Oxygen lacks
  globalThis["node:child_process"] = {};
  globalThis["node:util"] = { promisify: (fn) => fn };
  globalThis["node:assert"] = { ok: () => {} };

  console.log("✅ Oxygen runtime patched for missing Node modules");
}
