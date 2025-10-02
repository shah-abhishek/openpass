'use client';

import { useEffect, useState } from 'react';

const ISSUER = 'http://localhost:3001'; // IdP

export default function Callback() {
  const [status, setStatus] = useState('Exchanging code...');

  useEffect(() => {
    (async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');
      const verifier = sessionStorage.getItem('openpass_pkce_verifier');

      if (!code || !verifier) {
        setStatus('Missing code or verifier');
        return;
      }

      const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${location.origin}/cb`,
        client_id: 'next_example',
        code_verifier: verifier
      });

      try {
        const res = await fetch(`${ISSUER}/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body
        });
        if (!res.ok) {
          setStatus(`Token error: ${res.status}`);
          return;
        }
        const tok = await res.json();
        // DEV ONLY: store access token in a cookie so middleware can read it.
        // In production you would use httpOnly cookies via an API route.
        document.cookie = `app_access=${tok.access_token}; path=/`;
        setStatus('Login complete, redirecting...');
        window.location.replace('/dashboard');
      } catch (e: any) {
        setStatus(`Error: ${e?.message || 'unknown'}`);
      }
    })();
  }, []);

  return (
    <main>
      <h1>OIDC Callback</h1>
      <p>{status}</p>
    </main>
  );
}
