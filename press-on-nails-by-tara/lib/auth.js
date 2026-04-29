import crypto from 'crypto';

const SECRET = process.env.JWT_SECRET || 'tara-nails-dev-secret-change-in-production';
const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function createToken(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const claims = Buffer.from(
    JSON.stringify({ ...payload, iat: Date.now(), exp: Date.now() + TOKEN_TTL_MS })
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', SECRET).update(`${header}.${claims}`).digest('base64url');
  return `${header}.${claims}.${sig}`;
}

export function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;
  const raw = token.replace(/^Bearer\s+/i, '').trim();
  const parts = raw.split('.');
  if (parts.length !== 3) return null;
  const [header, claims, sig] = parts;
  try {
    const expected = crypto.createHmac('sha256', SECRET).update(`${header}.${claims}`).digest('base64url');
    if (expected !== sig) return null;
    const payload = JSON.parse(Buffer.from(claims, 'base64url').toString('utf8'));
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function isAdmin(req) {
  const auth = req.headers.get('authorization') || '';
  const payload = verifyToken(auth);
  return payload?.role === 'admin';
}
