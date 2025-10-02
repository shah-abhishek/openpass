apps/idp/
├─ src/
│  ├─ index.ts            # server bootstrap (oidc-provider)
│  ├─ config/             # oidc config, clients, features
│  ├─ routes/             # custom login UI, interactions, webhooks
│  ├─ services/           # users, sessions, tokens, mfa
│  ├─ store/              # db adapters (Postgres), Redis cache
│  ├─ utils/              # jwks rotation, crypto, email
│  └─ types/
├─ public/                # login assets
├─ .env.example
├─ package.json
├─ tsconfig.json
└─ README.md
