import { createRemoteJWKSet, jwtVerify, JWTPayload } from 'jose';

export type RequireAuthOptions = {
  issuer: string;
  audience?: string;
};

export function makeVerifier({ issuer, audience }: RequireAuthOptions) {
  const JWKS = createRemoteJWKSet(new URL(`${issuer}/jwks.json`));
  return async (token: string): Promise<JWTPayload> => {
    const { payload } = await jwtVerify(token, JWKS, { issuer, audience });
    return payload;
  };
}
