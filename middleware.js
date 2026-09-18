// HTTP Basic Auth for the whole site (Vercel Edge Middleware, no dependencies).
// Set BASIC_AUTH_USER and BASIC_AUTH_PASSWORD in Vercel > Project > Settings > Environment Variables.
// Fails closed: if either variable is missing, nobody gets in.
export const config = { matcher: '/(.*)' };

export default function middleware(request) {
  const user = process.env.BASIC_AUTH_USER;
  const pass = process.env.BASIC_AUTH_PASSWORD;
  const header = request.headers.get('authorization') || '';
  if (user && pass && header.startsWith('Basic ')) {
    try {
      const [u, ...rest] = atob(header.slice(6)).split(':');
      if (u === user && rest.join(':') === pass) {
        return new Response(null, { headers: { 'x-middleware-next': '1' } });
      }
    } catch (e) { /* fall through to 401 */ }
  }
  return new Response('Authentication required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="MIMA LinkedIn KPIs", charset="UTF-8"' },
  });
}
