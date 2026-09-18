// Password-only protection for the whole site (Vercel Edge Middleware, no dependencies).
// Set BASIC_AUTH_PASSWORD in Vercel > Project > Settings > Environment Variables.
// The browser login box also shows a username field: it is ignored, visitors can leave it empty or type anything.
// Fails closed: if the variable is missing, nobody gets in.
export const config = { matcher: '/(.*)' };

export default function middleware(request) {
  const pass = process.env.BASIC_AUTH_PASSWORD;
  const header = request.headers.get('authorization') || '';
  if (pass && header.startsWith('Basic ')) {
    try {
      const [, ...rest] = atob(header.slice(6)).split(':');
      if (rest.join(':') === pass) {
        return new Response(null, { headers: { 'x-middleware-next': '1' } });
      }
    } catch (e) { /* fall through to 401 */ }
  }
  return new Response('Password required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="MIMA LinkedIn KPIs", charset="UTF-8"' },
  });
}
