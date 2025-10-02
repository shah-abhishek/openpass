'use client';

import { login } from '@openpass/sdk-js';

export default function Login() {
  return (
    <main>
      <h1>Login</h1>
      <p>Redirects to the IdP using Authorization Code + PKCE.</p>
      <button
        onClick={() =>
          login({
            clientId: 'next_example',
            redirectUri: `${location.origin}/cb`,
            scope: 'openid profile email',
            issuer: 'http://localhost:3001'
          })
        }
      >
        Sign in with OpenPass
      </button>
    </main>
  );
}
