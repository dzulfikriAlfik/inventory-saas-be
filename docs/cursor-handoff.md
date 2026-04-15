# 4. Cursor Handoff — Inventory SaaS MVP

## Ringkasan proyek

Bangun **Inventory SaaS MVP** dengan dua repository terpisah: backend memakai **Express + TypeScript + Prisma + PostgreSQL**, frontend memakai **React + TypeScript**. Produk ini multi-tenant dengan model **shared database, shared schema, row-based tenancy** menggunakan `organizationId` di semua entitas bisnis. Pada MVP, satu user hanya berada di satu organization, sehingga `organizationId` boleh dibawa di payload JWT. Auth memakai **JWT di HttpOnly cookie**, dengan access token 1 hari dan refresh token 1 minggu. Scope MVP mencakup auth, membership, master data (`products`, `warehouses`, `suppliers`, `customers`), current stock, stock movement ledger, dan tiga transaksi inventory: `purchase receipts`, `sales shipments`, serta `stock adjustments`, semuanya mengikuti pola **draft → post**, di mana stok hanya berubah saat dokumen berstatus `POSTED`.

## Constraints penting

- Project harus dipisah jadi 2 repo:
  - `inventory-saas-be`
  - `inventory-saas-fe`
- Backend wajib:
  - Express
  - TypeScript
  - Prisma
  - PostgreSQL
- Frontend wajib:
  - React
  - TypeScript
- Auth wajib:
  - JWT
  - Disimpan di `HttpOnly cookie`
  - Frontend tidak menyimpan token di localStorage
- RBAC minimal:
  - `OWNER`
  - `ADMIN`
  - `STAFF`
- SaaS tenancy:
  - shared database
  - shared schema
  - semua data bisnis harus memiliki `organizationId`
- Pada MVP, satu user hanya punya satu organization.
- `organizationId` dikirim di JWT payload.
- Refresh token disimpan di tabel `Session` sebagai hash.
- Access token TTL = `1 day`
- Refresh token TTL = `1 week`
- Inventory design:
  - `Stock` = snapshot current state
  - `StockMovement` = ledger histori perubahan
- Draft transaksi **tidak** mengubah stok.
- Hanya status `POSTED` yang mengubah stok.
- Soft delete dipakai sejak MVP untuk master data penting.
- Audit fields transaksi:
  - `createdByUserId`
  - `postedByUserId`
- Dokumen `CANCELLED` hanya untuk draft.
- OpenAPI harus ada sejak awal.
- Unit test dan integration test harus ada sejak awal.
- Env dipisah untuk dev, test, dan production.
- Production domains:
  - FE: `inventory.pintarware.com`
  - BE: `inventory-be.pintarware.com`

## Cookie rules

### Production
- `httpOnly: true`
- `secure: true`
- `sameSite: 'none'`
- `domain: '.pintarware.com'`
- `path: '/'`

### Development
- `httpOnly: true`
- `secure: false`
- `sameSite: 'lax'`
- no domain override

## Coding conventions

- TypeScript strict mode.
- Pisahkan layer:
  - route
  - controller
  - service
  - validation schema
- Gunakan `zod` untuk request validation.
- Semua service tenant-aware: harus menerima atau membaca `organizationId`.
- Semua endpoint protected harus melalui:
  - auth middleware
  - organization middleware
  - RBAC middleware bila perlu
- Jangan campur business logic stok di controller.
- Logic posting transaction harus berada di service layer.
- Nama enum dan status harus eksplisit dan konsisten.
- Error response backend harus konsisten dan mudah dipakai frontend.
- Gunakan Prisma transaction untuk semua posting document.
- Untuk row lock shipment posting, raw SQL di dalam Prisma transaction diperbolehkan.
- Gunakan `withCredentials: true` di Axios frontend.
- Tulis OpenAPI bersamaan dengan endpoint.
- Tulis unit dan integration test bersamaan dengan feature kritikal.
- Unit dan integration test harus memenuhi coverage 85%+

## Hal yang jangan diubah

- Jangan ubah model SaaS menjadi single-tenant.
- Jangan pindahkan token ke localStorage atau sessionStorage.
- Jangan biarkan draft document mengubah stok.
- Jangan jadikan `Stock` satu-satunya sumber kebenaran tanpa `StockMovement`.
- Jangan hapus `organizationId` dari entitas bisnis.
- Jangan memasukkan fitur di luar MVP tanpa alasan kuat.
- Jangan membuat posting shipment tanpa validasi stok.
- Jangan menulis query data bisnis lintas tenant tanpa filter `organizationId`.
- Jangan menambah multi-organization per user pada MVP.
- Jangan mengganti `unit` product ke tabel terpisah pada MVP.

## Prompt siap tempel ke Cursor — mulai dari backend foundation

```md
You are helping me build an Inventory SaaS MVP.

Project constraints:
- Two separate repositories:
  1) inventory-saas-be
  2) inventory-saas-fe
- Backend must use Express + TypeScript + Prisma + PostgreSQL
- Frontend must use React + TypeScript
- Auth must use JWT stored in HttpOnly cookies
- Implement simple RBAC: OWNER, ADMIN, STAFF
- Multi-tenant SaaS with shared database/shared schema and row-based tenancy using organizationId
- All business entities must be organization-scoped
- On MVP, one user belongs to exactly one organization
- organizationId is allowed inside JWT payload for MVP
- Refresh token must be stored hashed in Session table
- Access token TTL = 1 day
- Refresh token TTL = 1 week
- Inventory model:
  - Stock = current snapshot
  - StockMovement = ledger/history
- Draft documents must NOT change stock
- Only POSTED documents change stock
- Soft delete is required from MVP
- Transaction audit fields:
  - createdByUserId
  - postedByUserId
- CANCELLED only applies to draft documents
- OpenAPI must exist from the beginning
- Unit tests and integration tests must exist from the beginning
- Separate envs for development, test, production

MVP modules only:
- Auth
- Organization / Membership
- Products
- Warehouses
- Suppliers
- Customers
- Stocks
- Stock Movements
- Purchase Receipts
- Sales Shipments
- Stock Adjustments

Excluded from MVP:
- Purchase Orders
- Sales Orders
- reserved_quantity
- stock transfers
- invoicing/payment
- subscription billing
- batch/serial/expiry

Implementation decisions already fixed:
- FE production domain: inventory.pintarware.com
- BE production domain: inventory-be.pintarware.com
- Production cookies:
  - httpOnly: true
  - secure: true
  - sameSite: 'none'
  - domain: '.pintarware.com'
  - path: '/'
- Development cookies:
  - httpOnly: true
  - secure: false
  - sameSite: 'lax'
- Product unit should be a simple string field for MVP, not a separate Unit table
- Document numbers are generated in the app layer
- Dashboard MVP metrics only:
  - total products
  - total warehouses
- Add env handling for development/test/production

Please start by generating the backend repository foundation with:
1. recommended folder structure
2. package.json
3. tsconfig.json
4. env loading strategy for dev/test/prod
5. Prisma schema for the MVP
6. auth module skeleton
7. organization + membership wiring
8. auth, organization, RBAC middlewares
9. OpenAPI setup
10. test setup (unit + integration)

Keep the implementation production-minded but MVP-sized.
Do not add features outside this scope.
```

## Prompt siap tempel ke Cursor — lanjut ke frontend foundation

```md
Build the frontend repository for the Inventory SaaS MVP using React + TypeScript + Vite.

Requirements:
- Use React Router
- Use TanStack Query
- Use Axios with withCredentials: true
- Assume auth is cookie-based with HttpOnly cookies
- Create a clean MVP admin layout
- Add protected routing
- Build the initial pages and route placeholders for:
  - Login
  - Dashboard
  - Products
  - Warehouses
  - Suppliers
  - Customers
  - Stocks
  - Stock Movements
  - Purchase Receipts
  - Sales Shipments
  - Stock Adjustments
  - Team Members
- Add env handling for development/test/production
- Keep code modular and feature-oriented
- Do not store JWT in localStorage

Start by generating:
1. folder structure
2. package.json
3. Vite + TypeScript setup notes
4. axios client
5. router
6. auth bootstrap flow using /auth/me
7. protected layout
8. placeholder pages for all MVP modules
```

## Open questions

- `jest` sebagai standard test runner.
- OpenAPI approach: code-first.
- member creation flow masuk sprint awal.
