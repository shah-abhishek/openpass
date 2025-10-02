infra/
├─ docker/
│  ├─ idp.Dockerfile
│  ├─ nginx.Dockerfile
│  └─ migrate.Dockerfile
├─ db/
│  ├─ migrations/
│  │  ├─ 0001_init.sql
│  │  └─ 0002_seed.sql
│  └─ seed/
├─ compose/
│  ├─ dev.yml
│  └─ prod.yml
└─ nginx/
   ├─ nginx.conf          # reverse-proxy to IdP, JWKS cache
   └─ ssl/