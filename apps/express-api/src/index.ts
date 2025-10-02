import express from 'express';
import { createRemoteJWKSet, jwtVerify } from 'jose';

const app = express();
app.use(express.json());

const ISSUER = process.env.OPENPASS_ISSUER || 'https://localhost:8080';
const AUD = 'webapi';
const JWKS = createRemoteJWKSet(new URL(`${ISSUER}/jwks.json`));

async function requireAuth(req: any, res: any, next: any) {
  try {
    const token = (req.headers.authorization || '').replace(/^Bearer /, '');
    if (!token) return res.sendStatus(401);
    const { payload } = await jwtVerify(token, JWKS, { issuer: ISSUER, audience: AUD });
    req.user = payload;
    next();
  } catch {
    res.sendStatus(401);
  }
}

app.get('/health', (_req, res) => res.json({ ok: true }));

app.get('/secret', requireAuth, (req, res) => {
  res.json({ ok: true, user: (req as any).user || null });
});

const port = Number(process.env.PORT || 4001);
app.listen(port, () => console.log(`express-api listening on :${port}`));
