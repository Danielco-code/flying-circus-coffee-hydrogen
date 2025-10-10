export function json(data) {
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
}

export function redirect(url, init = 302) {
  return new Response(null, { status: init, headers: { Location: url } });
}

export default {};
