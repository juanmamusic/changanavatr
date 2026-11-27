// Acceso privado al sitio AVATR 11.
// Corre en Vercel antes de entregar cualquier archivo (HTML, 3D, fotos, video).
// Usuario y contraseña viven en las variables de entorno AUTH_USER y AUTH_PASS del proyecto en Vercel; nunca en este archivo.
import { next } from '@vercel/functions';

export const config = { matcher: '/:path*' };

const COOKIE = 'av_session';
const DAYS = 7;
// Archivos que la pantalla de acceso necesita antes de iniciar sesión.
const PUBLIC = new Set(['/img/pabellon.webp', '/favicon.ico', '/favicon.svg', '/apple-touch-icon.png']);

const enc = new TextEncoder();
async function sign(data, secret) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(data)));
  return btoa(String.fromCharCode(...mac)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function same(a, b) {
  a = String(a); b = String(b);
  let d = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) d |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return d === 0;
}
function readCookie(req, name) {
  const m = (req.headers.get('cookie') || '').match(new RegExp('(?:^|;\\s*)' + name + '=([^;]+)'));
  return m ? decodeURIComponent(m[1]) : '';
}
// Cambiar la contraseña invalida todas las sesiones abiertas.
const secretOf = (u, p) => (process.env.AUTH_SECRET || '') + '|' + u + '|' + p;

async function valid(req, u, p) {
  const [exp, mac] = readCookie(req, COOKIE).split('.');
  if (!exp || !mac || Date.now() > +exp) return false;
  return same(mac, await sign(exp, secretOf(u, p)));
}

export default async function middleware(req) {
  const url = new URL(req.url);
  const U = process.env.AUTH_USER, P = process.env.AUTH_PASS;
  if (!U || !P) return page('Falta configurar el acceso en Vercel (AUTH_USER y AUTH_PASS).', 503, url);

  if (url.pathname === '/__login' && req.method === 'POST') {
    const f = await req.formData();
    const to = safeNext(f.get('next'));
    if (same(f.get('user') || '', U) && same(f.get('pass') || '', P)) {
      const exp = String(Date.now() + DAYS * 864e5);
      const val = exp + '.' + (await sign(exp, secretOf(U, P)));
      return new Response(null, { status: 303, headers: {
        Location: to,
        'Set-Cookie': `${COOKIE}=${val}; Path=/; Max-Age=${DAYS * 86400}; HttpOnly; Secure; SameSite=Lax`,
        'Cache-Control': 'no-store' } });
    }
    return new Response(null, { status: 303, headers: { Location: '/?e=1&next=' + encodeURIComponent(to), 'Cache-Control': 'no-store' } });
  }
  if (url.pathname === '/__logout') {
    return new Response(null, { status: 303, headers: { Location: '/', 'Set-Cookie': `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax` } });
  }
  if (PUBLIC.has(url.pathname)) return next();
  if (await valid(req, U, P)) return next({ headers: { 'Cache-Control': 'private, no-store' } });

  // Sin sesión: las páginas muestran la pantalla de acceso; cualquier otro archivo responde 401.
  const wantsHtml = (req.headers.get('accept') || '').includes('text/html');
  if (!wantsHtml) return new Response('Acceso restringido', { status: 401, headers: { 'Cache-Control': 'no-store' } });
  return page(url.searchParams.get('e') ? 'Usuario o contraseña incorrectos.' : '', 401, url);
}

function safeNext(v) {
  v = String(v || '/');
  return v.startsWith('/') && !v.startsWith('//') && !v.startsWith('/__') ? v : '/';
}
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function page(msg, status, url) {
  const nx = safeNext(url.searchParams.get('next') || (url.pathname === '/' ? '/' : url.pathname + url.search));
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex,nofollow"><title>AVATR 11 · Acceso privado</title>
<link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="icon" href="/favicon.ico" sizes="any"><link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
:root{--ink:#2a2430;--ink2:#5b5563;--mute:#8a8593;--pearl:#eef0f5;--sky:#c9d6ea;--blush:#f6efee}
*{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%}
html{background:#c9d6ea url(/img/pabellon.webp) 64% 60%/cover no-repeat fixed;min-height:100%}
body{font-family:Manrope,system-ui,sans-serif;color:var(--ink);min-height:100svh;display:flex;align-items:center;justify-content:center;padding:24px}
body::before{content:"";position:fixed;inset:0;background:linear-gradient(160deg,rgba(214,222,236,.86),rgba(238,240,245,.55) 55%,rgba(246,239,238,.7))}
.card{position:relative;width:100%;max-width:420px;padding:40px 34px 34px;border-radius:24px;background:rgba(246,244,247,.62);border:1px solid rgba(255,255,255,.7);backdrop-filter:blur(24px) saturate(160%);-webkit-backdrop-filter:blur(24px) saturate(160%);box-shadow:0 30px 80px rgba(42,36,48,.16);animation:in .9s cubic-bezier(.2,.7,.2,1) both}
@keyframes in{from{opacity:0;transform:translateY(14px)}}
.logo{display:flex;align-items:center;gap:12px}.logo img{height:20px}.logo span{font-size:15px;letter-spacing:.14em;color:var(--ink2);border-left:1px solid rgba(42,36,48,.25);padding-left:12px}
.eb{margin-top:34px;font-size:11.5px;letter-spacing:.24em;text-transform:uppercase;font-weight:600;color:var(--ink2)}
h1{font-weight:300;font-size:34px;line-height:1.1;letter-spacing:-.01em;margin-top:10px}
p.lead{font-size:15px;line-height:1.55;color:var(--ink2);margin-top:10px}
form{margin-top:26px;display:flex;flex-direction:column;gap:14px}
label{font-size:13px;font-weight:600;color:var(--ink2);display:block;margin-bottom:7px}
input{width:100%;min-height:52px;border-radius:14px;border:1px solid rgba(42,36,48,.18);background:rgba(255,255,255,.75);font:400 16px Manrope,system-ui,sans-serif;color:var(--ink);padding:0 16px;outline:none;transition:border-color .2s,box-shadow .2s}
input:focus{border-color:var(--ink);box-shadow:0 0 0 4px rgba(42,36,48,.08)}
button{margin-top:8px;min-height:54px;border:0;border-radius:999px;background:var(--ink);color:#fff;font:600 16px Manrope,system-ui,sans-serif;cursor:pointer;transition:transform .2s,background .2s}
button:hover{background:#1f1a20}button:active{transform:scale(.99)}
.err{font-size:14px;color:#a2463a;background:rgba(192,103,91,.1);border-radius:12px;padding:10px 14px;margin-top:18px}
.foot{margin-top:22px;font-size:12.5px;color:var(--mute);line-height:1.5}
</style></head><body>
<main class="card">
  <div class="logo"><img src="https://avatruae.com/wp-content/uploads/2024/05/AVATR-Logo-%E2%80%93-Full.svg" alt="AVATR" referrerpolicy="no-referrer"><span>11</span></div>
  <p class="eb">Acceso privado</p>
  <h1>Propuesta digital AVATR 11.</h1>
  <p class="lead">Este sitio es confidencial. Ingresa con el usuario y la contraseña que recibiste.</p>
  ${msg ? `<p class="err" role="alert">${esc(msg)}</p>` : ''}
  <form method="post" action="/__login">
    <input type="hidden" name="next" value="${esc(nx)}">
    <div><label for="u">Usuario</label><input id="u" name="user" autocomplete="username" autocapitalize="none" spellcheck="false" required autofocus></div>
    <div><label for="p">Contraseña</label><input id="p" name="pass" type="password" autocomplete="current-password" required></div>
    <button type="submit">Entrar</button>
  </form>
  <p class="foot">Powered by JMA Digital</p>
</main></body></html>`;
  return new Response(html, { status, headers: { 'content-type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } });
}
