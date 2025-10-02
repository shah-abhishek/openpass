apps/next-example/
├─ app/
│  ├─ layout.tsx
│  ├─ page.tsx             # public
│  ├─ app/                 # protected pages
│  │  └─ page.tsx
│  ├─ api/
│  │  ├─ refresh/route.ts  # cookie-based refresh
│  │  └─ me/route.ts       # demo API
├─ middleware.ts           # guard /app routes
├─ public/
├─ .env.local.example
├─ package.json
└─ tsconfig.json
