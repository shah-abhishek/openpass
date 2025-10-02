import { Provider } from 'oidc-provider';

const PORT = Number(process.env.PORT || 3001);
const ISSUER = process.env.ISSUER || `http://localhost:${PORT}`;

const configuration: any = {
  clients: [
    {
      client_id: 'next_example',
      redirect_uris: ['http://localhost:3002/cb'],
      response_types: ['code'],
      grant_types: ['authorization_code', 'refresh_token'],
      token_endpoint_auth_method: 'none'
    }
  ],
  pkce: { required: () => true, methods: ['S256'] },
  features: {
    devInteractions: { enabled: true },
    rpInitiatedLogout: { enabled: true },
    revocation: { enabled: true }
  },
  cookies: {
    names: { session: '_openpass.sess' },
    keys: ['dev_cookie_key_1', 'dev_cookie_key_2']
  },
  claims: { openid: ['sub'], profile: ['email', 'roles', 'permissions'] },
  async findAccount(_ctx: unknown, accountId: string) {
    return {
      accountId,
      async claims() {
        return {
          sub: accountId,
          email: `${accountId}@example.com`,
          roles: ['member'],
          permissions: ['doc:view']
        };
      }
    };
  }
};

async function main() {
  const oidc = new Provider(ISSUER, configuration);
  oidc.proxy = true;
  oidc.listen(PORT, () => console.log(`IdP running at ${ISSUER}`));
}

main().catch(err => { console.error(err); process.exit(1); });
