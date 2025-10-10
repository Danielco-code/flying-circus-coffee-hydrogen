// app/remix-node-stub.js
export const json = (data, init = {}) => {
  console.warn('Stubbed json() called in Oxygen runtime');
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json', ...init.headers },
    status: init.status || 200,
  });
};

export const redirect = (url, init = 302) => {
  console.warn('Stubbed redirect() called in Oxygen runtime');
  return Response.redirect(url, init);
};

export default { json, redirect };
