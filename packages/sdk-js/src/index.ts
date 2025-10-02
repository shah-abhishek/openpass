export type LoginOptions = {
  clientId: string;
  redirectUri: string;
  scope?: string;
  orgId?: string;
  issuer?: string;
};

function base64url(bytes: Uint8Array) {
  let s = btoa(String.fromCharCode(...bytes));
  return s.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function sha256(input: string) {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return base64url(new Uint8Array(hash));
}

export async function login(opts: LoginOptions) {
  const {
    clientId,
    redirectUri,
    scope = 'openid profile email',
    orgId,
    issuer = (globalThis as any).OPENPASS_ISSUER || 'https://localhost:8080'
  } = opts;

  const verifierBytes = crypto.getRandomValues(new Uint8Array(32));
  const verifier = base64url(verifierBytes);
  const challenge = await sha256(verifier);
  sessionStorage.setItem('openpass_pkce_verifier', verifier);

  const url = new URL(`${issuer}/auth`);
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('redirect_uri', encodeURI(redirectUri));
  url.searchParams.set('scope', scope);
  url.searchParams.set('code_challenge', challenge);
  url.searchParams.set('code_challenge_method', 'S256');
  if (orgId) url.searchParams.set('org_id', orgId);

  location.assign(url.toString());
}

declare global {
  interface Window { OpenPass?: any }
}
if (typeof window !== 'undefined') {
  (window as any).OpenPass = (window as any).OpenPass || {};
  (window as any).OpenPass.login = login;
}
