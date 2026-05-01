# Inventory SaaS — Backend

Express + TypeScript API for the Inventory SaaS MVP: multi-tenant inventory, auth with JWT in HttpOnly cookies, Prisma + PostgreSQL, OpenAPI docs, and structured logging.

## Prerequisites

- **Node.js** (LTS recommended)
- **npm**
- **PostgreSQL** (local or remote)

## Setup

```bash
npm install
```

Create environment files from the example:

```bash
cp .env.example .env.development
```

Edit `.env.development` at minimum:

- `DATABASE_URL` — PostgreSQL connection string
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` — strong random strings
- `FRONTEND_URL` — SPA origin for CORS and cookie usage (e.g. `http://localhost:5173`)

Generate the Prisma client and apply migrations:

```bash
npm run prisma:generate
npm run prisma:migrate:dev
```

## Database seed (MVP demo data)

After migrations, you can load demo users, one tenant, master data, and sample DRAFT documents (development only — **this command deletes all rows** in the seeded tables first):

```bash
npm run db:seed
```

Uses `.env.development` for `DATABASE_URL`. Demo logins are printed when the run finishes (same password for all demo accounts).

## Scripts

| Command | Description |
|--------|-------------|
| `npm run dev` | API with `tsx watch` (development) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start` | Run compiled server (`NODE_ENV=production`) |
| `npm run prisma:generate` | Prisma Client (uses `.env.development`) |
| `npm run prisma:migrate:dev` | Create/apply migrations (dev) |
| `npm run prisma:migrate:test` | Deploy migrations (test DB from `.env.test`) |
| `npm run prisma:studio` | Prisma Studio |
| `npm run db:seed` | Reset and seed MVP demo data (dev DB) |
| `npm test` | Jest (unit + integration) |
| `npm run test:unit` | Unit tests only |
| `npm run test:integration` | Integration tests only |

## Stack

- Express 5, TypeScript
- Prisma ORM, PostgreSQL
- Zod validation, JWT + cookies, i18n, Winston (optional daily file logs under `logs/` when configured)

## API documentation

With the server running, **Swagger UI** is available at **`/docs`** (for example `http://localhost:3000/docs` when `PORT=3000`).

## Project layout

Source lives under `src/` (modules, middlewares, config, tests). See `docs/architecture.md` for conventions.

## Local development with the SPA

Point the frontend `VITE_API_URL` at this service (e.g. `http://localhost:3000`). Ensure `FRONTEND_URL` matches the Vite dev origin so CORS and cookies behave correctly.
