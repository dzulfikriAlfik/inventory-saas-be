# Backend Foundation

## Detected baseline

- Primary language: TypeScript (Node.js backend)
- Dominant architecture pattern: Layered modular API (`routes -> controllers -> services -> libraries/config`)
- Pattern fitness: idiomatic for TypeScript + Express and consistent with project handoff

## Recommended folder structure

```text
inventory-saas-be/
├─ prisma/
│  └─ schema.prisma
├─ src/
│  ├─ app.ts
│  ├─ server.ts
│  ├─ config/
│  │  ├─ env.ts
│  │  ├─ cookie.ts
│  │  └─ openapi.ts
│  ├─ lib/
│  │  ├─ prisma.ts
│  │  ├─ jwt.ts
│  │  └─ password.ts
│  ├─ middlewares/
│  │  ├─ auth.middleware.ts
│  │  ├─ org.middleware.ts
│  │  ├─ rbac.middleware.ts
│  │  ├─ validate.middleware.ts
│  │  └─ error.middleware.ts
│  ├─ modules/
│  │  ├─ auth/
│  │  ├─ organizations/
│  │  └─ members/
│  ├─ routes/
│  │  └─ index.ts
│  ├─ test/
│  │  ├─ setup/
│  │  ├─ integration/
│  │  └─ unit/
│  ├─ types/
│  │  └─ express.d.ts
│  └─ utils/
│     ├─ api-error.ts
│     └─ async-handler.ts
├─ package.json
├─ tsconfig.json
└─ jest.config.ts
```

## Environment strategy (development/test/production)

- Environment files:
  - `.env.development`
  - `.env.test`
  - `.env.production`
- Runtime loading:
  - `src/config/env.ts` loads `.env.${NODE_ENV}` using `dotenv`.
  - Variables are validated with `zod` at startup.
  - Server startup fails fast if required env values are missing/invalid.

## Notes

- JWT is cookie-based and configured with production/development cookie policy.
- Auth foundation includes register/login/refresh/logout/me.
- Membership and organization context are wired for tenant-aware middleware usage.
