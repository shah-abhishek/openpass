# OpenPass — Portable Login & SSO Monorepo

A drop-in **Identity Provider (IdP)** and SDK set to add modern login + SSO to any app (Next.js, Node/Express, ASP.NET, plain JS). Uses **OpenID Connect (OIDC)** with Authorization Code + **PKCE**, and includes examples + guards for protecting routes and content.

---

## Table of Contents
- [Features](#features)
- [Repo Structure](#repo-structure)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [IdP vs Node Version Matrix](#idp-vs-node-version-matrix)
- [How the Flow Works](#how-the-flow-works)
- [SDK Usage](#sdk-usage)
- [Environment Variables](#environment-variables)
- [Production Notes](#production-notes)
- [Security Checklist](#security-checklist)
- [Troubleshooting](#troubleshooting)
- [Roadmap](#roadmap)
- [License](#license)

---

## Features

**MVP (now)**
- ✅ OIDC **Authorization Code + PKCE** (public client friendly)
- ✅ Dev login UI (**devInteractions**) for instant local testing
- ✅ **Next.js** protected example with middleware guard
- ✅ **Embeddable JS login** (`@openpass/sdk-js`)
- ✅ **Node SDK** for JWT verification (`@openpass/sdk-node`)
- ✅ **Policy helpers** (`@openpass/policy`) for RBAC wiring

**Next**
- 🔐 HttpOnly cookies + **refresh token rotation**
- 🧩 Social login (Google / Microsoft / GitHub)
- 👆 MFA / **WebAuthn**, email verification, passwordless
- 🧭 Admin console (users, orgs, roles, clients, policies)
- 🔁 **JWKS rotation**, Postgres/Redis adapters, rate limiting

---

## Repo Structure

openpass/
├─ apps/
│ ├─ idp/ # Identity Provider (oidc-provider)
│ ├─ next-example/ # Next.js protected demo (App Router)
│ ├─ express-api/ # Example resource API (JWT-protected)
│ ├─ aspnet-mvc-legacy/ # Sample (TBD)
│ └─ aspnet-core/ # Sample (TBD)
├─ packages/
│ ├─ sdk-js/ # Embeddable login widget (browser)
│ ├─ sdk-react/ # React provider + hooks
│ ├─ sdk-node/ # JWKS cache + jwtVerify wrapper
│ └─ policy/ # RBAC helpers
├─ infra/ # (Docker, DB migrations, nginx) — optional
├─ docs/ # Diagrams, ADRs (optional)
├─ package.json # pnpm workspaces
├─ pnpm-workspace.yaml
├─ tsconfig.base.json
└─ README.md


---

## Prerequisites

- **Node.js**
  - **Recommended:** Node **22.x LTS** (works with `oidc-provider@9.x`)
  - **Alternative:** Node **20.x** + `oidc-provider@7.15.8` (fallback)
- **pnpm**
  - Corepack (recommended):  
    ```powershell
    corepack enable
    corepack prepare pnpm@9.12.0 --activate
    pnpm -v
    ```
  - Or via npm: `npm i -g pnpm@9.12.0`
- **Windows (PowerShell) tips**
  - If scripts are blocked: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned -Force`
  - Ensure global npm bin on PATH (if needed):  
    ```powershell
    $env:Path += ";$([Environment]::GetFolderPath('ApplicationData'))\npm"
    ```

---

## Quick Start

> **Choose your Node path first** (see matrix below).  
> - If using **Node 22**: keep `oidc-provider@9.5.1` in `apps/idp/package.json`.  
> - If using **Node 20**: set `oidc-provider@7.15.8` in `apps/idp/package.json`.

1. **Install dependencies (root)**
   ```powershell
   pnpm install


##Run the IdP and Next example (use two terminals)

# Terminal A
pnpm --filter @openpass/idp dev

# Terminal B
pnpm --filter @openpass/next-example dev

Try the auth flow

Open http://localhost:3002/login
 → click Sign in with OpenPass

You’ll land on IdP dev login at http://localhost:3001/auth

Enter any username (e.g., abhishek) and continue

App callback at /cb exchanges the code, sets a cookie (dev), and redirects to /dashboard

In the MVP, the Next middleware checks a cookie and (optionally) verifies the JWT using jose. Upcoming commits move tokens to HttpOnly cookies and add refresh rotation.

IdP vs Node Version Matrix

Pick one:
|          Option | Node Version | IdP package version    | Notes                            |
| --------------: | ------------ | ---------------------- | -------------------------------- |
| A (recommended) | **22.x LTS** | `oidc-provider@9.5.1`  | Latest, no Koa, modern runtime   |
|    B (fallback) | **20.x**     | `oidc-provider@7.15.8` | Works on Node 20; fewer features |

Switch Node (Windows nvm4w):

nvm install 22.11.0
nvm use 22.11.0
corepack enable
corepack prepare pnpm@9.12.0 --activate


How the Flow Works

Browser/app calls OpenPass.login({ clientId, redirectUri, issuer, scope }).

IdP /auth presents login (devInteractions) → successful login issues an authorization code.

App’s callback (/cb) exchanges the code at IdP /token using PKCE verifier.

IdP returns tokens (access token, ID token).

App stores session (MVP uses a readable cookie for demo; production uses HttpOnly cookies).

Protected routes verify presence/validity of the token and (optionally) check permissions.

IdP endpoints (typical):

/.well-known/openid-configuration

/auth, /token, /userinfo, /jwks.json, /logout

SDK Usage
Browser (vanilla / any framework)

<script type="module">
  import { login } from '@openpass/sdk-js';
  document.getElementById('btn').onclick = () => {
    login({
      clientId: 'next_example',
      redirectUri: location.origin + '/cb',
      issuer: 'http://localhost:3001',
      scope: 'openid profile email'
    });
  };
</script>
<button id="btn">Sign in</button>


React
import { OpenPassProvider, useAuth } from '@openpass/sdk-react';

function App() {
  const { isAuthenticated, user, login } = useAuth();
  return (
    <div>
      {!isAuthenticated && (
        <button onClick={() => login({
          clientId: 'next_example',
          redirectUri: location.origin + '/cb',
          issuer: 'http://localhost:3001'
        })}>
          Sign in
        </button>
      )}
      {isAuthenticated && <pre>{JSON.stringify(user, null, 2)}</pre>}
    </div>
  );
}

export default function Root() {
  return <OpenPassProvider><App /></OpenPassProvider>;
}


Node/Express (resource server)
import express from 'express';
import { createRemoteJWKSet, jwtVerify } from 'jose';

const app = express();
const ISSUER = 'http://localhost:3001';
const JWKS = createRemoteJWKSet(new URL(`${ISSUER}/jwks.json`));

const requireAuth = async (req, res, next) => {
  const token = (req.headers.authorization || '').replace(/^Bearer /, '');
  if (!token) return res.sendStatus(401);
  try {
    await jwtVerify(token, JWKS, { issuer: ISSUER });
    next();
  } catch {
    res.sendStatus(401);
  }
};

app.get('/secret', requireAuth, (req, res) => res.json({ ok: true }));
app.listen(4001);


Environment Variables

Root .env.example

OPENPASS_ISSUER=http://localhost:3001
OPENPASS_COOKIE_DOMAIN=localhost


IdP (apps/idp/.env.example)

PORT=3001
ISSUER=${OPENPASS_ISSUER}
# Future: DATABASE_URL, REDIS_URL, SESSION_SECRET, JWT TTLs, ALLOWED_REDIRECTS


Next (apps/next-example/.env.local.example)

NEXT_PUBLIC_IDP_ISSUER=http://localhost:3001
NEXT_PUBLIC_CLIENT_ID=next_example
APP_COOKIE_DOMAIN=localhost

Production Notes

Replace devInteractions with your own login UI and real user store.

Persist users/clients/grants in Postgres; use Redis for sessions/rate limiting.

Use HttpOnly, Secure, SameSite cookies; protect against CSRF.

Rotate JWKS keys; include kid in JWT headers; enforce strict allowed redirect URIs.

Emit only necessary claims; consider opaque tokens + introspection for sensitive APIs.

Security Checklist

 PKCE required for public clients

 Short access token TTL (5–15 min)

 Rotating refresh tokens (one-time use)

 HttpOnly cookies for browser sessions

 CORS + exact allowed redirect URIs

 JWKS rotation policy

 MFA / WebAuthn (planned)

 Rate limiting, login throttling, audit logs

Troubleshooting

pnpm not found (after switching Node with nvm)

corepack enable
corepack prepare pnpm@9.12.0 --activate


“No matching version for oidc-provider@8.x
”

Use Node 22 + oidc-provider@9.5.1, or

Stay on Node 20 + oidc-provider@7.15.8.

“Unsupported runtime. Use Node.js v22.x LTS” or URL.parse is not a function

You’re running oidc-provider@9.x on Node 20. Upgrade Node or pin to v7.15.8.

'next' is not recognized

Install failed earlier; run pnpm install at repo root.

Verify: pnpm why next shows it under @openpass/next-example.

Windows: allow scripts / align PATH

Set-ExecutionPolicy -Scope CurrentUser RemoteSigned -Force
$env:Path += ";$([Environment]::GetFolderPath('ApplicationData'))\npm"

Roadmap

Refresh token rotation & secure HttpOnly session cookies

Social identity providers (Google / Microsoft / GitHub)

Admin console (orgs, users, roles, clients, policies)

Multitenancy claims (org_id, entitlements[])

ABAC (canView(document) rules)

DB migrations + adapters

Nginx/Envoy samples for protecting static assets

License

See LICENSE
. (MIT by default; update as needed.)


Copy-paste that into `README.md` at the repo root. If you want this tailored with screenshots, badges, or your company naming, tell me the details and I’ll tweak it.
::contentReference[oaicite:0]{index=0}