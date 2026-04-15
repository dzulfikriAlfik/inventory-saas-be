# 2. Architecture — Inventory SaaS MVP

## Recommended tech stack

### Backend repo
- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT
- `cookie-parser`
- `bcrypt`
- `zod`
- `swagger-jsdoc` / `swagger-ui-express` atau generator OpenAPI sejenis
- `vitest` atau `jest`
- `supertest`

### Frontend repo
- React
- TypeScript
- Vite
- React Router
- TanStack Query
- Axios
- React Hook Form
- Zod resolver

### SaaS tenancy model
- Shared database
- Shared schema
- Row-based multi-tenancy
- Semua data bisnis membawa `organizationId`

## Data model / entities

### Identity and SaaS
- `User`
- `Session`
- `Organization`
- `Membership`

### Master data
- `Product`
- `Warehouse`
- `Supplier`
- `Customer`

### Inventory core
- `Stock`
- `StockMovement`

### Transactions
- `PurchaseReceipt`
- `PurchaseReceiptItem`
- `SalesShipment`
- `SalesShipmentItem`
- `StockAdjustment`
- `StockAdjustmentItem`

## Key design rules

- Sumber kebenaran bisnis inventory adalah:
  - dokumen transaksi
  - stock movement ledger
- `Stock` dipakai sebagai snapshot untuk read cepat.
- Draft document **tidak** mengubah stok.
- Hanya document dengan status `POSTED` yang mengubah stok.
- `StockMovement` harus menyimpan:
  - `movementType`
  - `documentType`
  - `documentId`
- Semua entitas bisnis tenant-specific wajib punya `organizationId`.
- User MVP hanya memiliki satu organization, jadi `organizationId` boleh dibawa di JWT payload.
- Semua entitas yang bisa dihapus secara bisnis menggunakan **soft delete**.
- Semua transaksi inventory harus memiliki:
  - `createdByUserId`
  - `postedByUserId`

## Recommended enums

### Role
- `OWNER`
- `ADMIN`
- `STAFF`

### ReceiptStatus
- `DRAFT`
- `POSTED`
- `CANCELLED`

### ShipmentStatus
- `DRAFT`
- `POSTED`
- `CANCELLED`

### AdjustmentStatus
- `DRAFT`
- `POSTED`
- `CANCELLED`

### MovementType
- `IN`
- `OUT`
- `ADJUSTMENT_IN`
- `ADJUSTMENT_OUT`

### MovementDocumentType
- `PURCHASE_RECEIPT`
- `SALES_SHIPMENT`
- `STOCK_ADJUSTMENT`

## API endpoints / service boundaries

## Auth
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`

## Members
- `GET /members`
- `PATCH /members/:id/role`

> Catatan: Karena 1 user = 1 org pada MVP, endpoint invite/create member bisa ditunda atau dibuat nanti setelah flow user creation diputuskan lebih detail.

## Products
- `GET /products`
- `POST /products`
- `PATCH /products/:id`
- `DELETE /products/:id`

## Warehouses
- `GET /warehouses`
- `POST /warehouses`
- `PATCH /warehouses/:id`
- `DELETE /warehouses/:id`

## Suppliers
- `GET /suppliers`
- `POST /suppliers`
- `PATCH /suppliers/:id`
- `DELETE /suppliers/:id`

## Customers
- `GET /customers`
- `POST /customers`
- `PATCH /customers/:id`
- `DELETE /customers/:id`

## Stocks
- `GET /stocks`
- `GET /stocks/movements`

## Purchase Receipts
- `GET /purchase-receipts`
- `POST /purchase-receipts`
- `GET /purchase-receipts/:id`
- `PATCH /purchase-receipts/:id`
- `POST /purchase-receipts/:id/post`
- `POST /purchase-receipts/:id/cancel`

## Sales Shipments
- `GET /sales-shipments`
- `POST /sales-shipments`
- `GET /sales-shipments/:id`
- `PATCH /sales-shipments/:id`
- `POST /sales-shipments/:id/post`
- `POST /sales-shipments/:id/cancel`

## Stock Adjustments
- `GET /stock-adjustments`
- `POST /stock-adjustments`
- `GET /stock-adjustments/:id`
- `PATCH /stock-adjustments/:id`
- `POST /stock-adjustments/:id/post`
- `POST /stock-adjustments/:id/cancel`

## Dashboard
- `GET /dashboard/summary`

## Environment strategy

Pisahkan environment untuk:
- development
- test
- production

### Contoh file env backend
- `.env.development`
- `.env.test`
- `.env.production`

### Contoh variable penting backend
- `NODE_ENV`
- `PORT`
- `DATABASE_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_ACCESS_TTL=1d`
- `JWT_REFRESH_TTL=7d`
- `COOKIE_DOMAIN`
- `COOKIE_SECURE`
- `COOKIE_SAME_SITE`
- `FRONTEND_URL`

### Frontend env
- `.env.development`
- `.env.test`
- `.env.production`

### Contoh variable penting frontend
- `VITE_API_URL`

## Cookie strategy

### Production
Karena FE dan BE beda subdomain:
- FE: `inventory.pintarware.com`
- BE: `inventory-be.pintarware.com`

Rekomendasi produksi paling aman:
- `httpOnly: true`
- `secure: true`
- `sameSite: 'none'`
- `domain: '.pintarware.com'`
- `path: '/'`

### Development
Agar tidak ribet, rekomendasi development:
- FE: `http://localhost:5173`
- BE: `http://localhost:3000`
- `httpOnly: true`
- `secure: false`
- `sameSite: 'lax'`
- tanpa domain khusus

> Catatan: jika local FE/BE lintas origin dan cookie tidak ikut, fallback development bisa pakai reverse proxy atau menyamakan host lewat local domain.

## Folder structure yang disarankan

### Backend — `inventory-saas-be`
```text
inventory-saas-be/
├─ prisma/
│  ├─ schema.prisma
│  └─ migrations/
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
│  │  ├─ error.middleware.ts
│  │  └─ validate.middleware.ts
│  ├─ modules/
│  │  ├─ auth/
│  │  ├─ organizations/
│  │  ├─ members/
│  │  ├─ products/
│  │  ├─ warehouses/
│  │  ├─ suppliers/
│  │  ├─ customers/
│  │  ├─ stocks/
│  │  ├─ purchase-receipts/
│  │  ├─ sales-shipments/
│  │  ├─ stock-adjustments/
│  │  └─ dashboard/
│  ├─ test/
│  │  ├─ setup/
│  │  ├─ factories/
│  │  ├─ integration/
│  │  └─ unit/
│  ├─ types/
│  └─ utils/
├─ package.json
└─ tsconfig.json
```

### Frontend — `inventory-saas-fe`
```text
inventory-saas-fe/
├─ src/
│  ├─ app/
│  │  ├─ router.tsx
│  │  └─ providers.tsx
│  ├─ api/
│  │  ├─ axios.ts
│  │  └─ types.ts
│  ├─ features/
│  │  ├─ auth/
│  │  ├─ members/
│  │  ├─ products/
│  │  ├─ warehouses/
│  │  ├─ suppliers/
│  │  ├─ customers/
│  │  ├─ stocks/
│  │  ├─ purchase-receipts/
│  │  ├─ sales-shipments/
│  │  ├─ stock-adjustments/
│  │  └─ dashboard/
│  ├─ pages/
│  ├─ components/
│  ├─ hooks/
│  └─ main.tsx
├─ package.json
└─ tsconfig.json
```

## Risks and tradeoffs

### 1. `organizationId` di JWT
**Keuntungan**
- Sangat sederhana untuk MVP.
- Tidak perlu tenant selector.
- Middleware lebih mudah.

**Tradeoff**
- Tidak fleksibel jika nanti 1 user bisa punya banyak org.

### 2. Soft delete sejak awal
**Keuntungan**
- Aman untuk data bisnis.
- Riwayat tetap terjaga.

**Tradeoff**
- Semua query list harus ingat filter deleted.
- Constraint unik perlu dipikirkan bila record soft-deleted masih menyimpan nilai unik.

### 3. Prisma vs stock locking
**Keuntungan**
- Prisma mempercepat CRUD dan maintainability.

**Tradeoff**
- Prisma tidak ideal untuk `SELECT ... FOR UPDATE`.

**Keputusan**
- CRUD biasa pakai Prisma.
- Proses posting stok yang butuh row lock gunakan `tx.$queryRaw` di dalam Prisma transaction.

### 4. OpenAPI sejak awal
**Keuntungan**
- API contract lebih jelas.
- Nanti mudah dipakai untuk contract test.

**Tradeoff**
- Menambah disiplin dokumentasi sejak awal.

### 5. Unit sebagai string
**Keuntungan**
- Scope lebih kecil.
- Implementasi lebih cepat.

**Tradeoff**
- Butuh normalisasi value agar tidak ada `pcs`, `PCS`, `Pcs` yang campur.

## Open questions

- Apakah endpoint tambah member perlu masuk MVP awal, atau cukup daftar owner dulu dan role update untuk member yang dibuat manual di DB saat fase awal?
- Untuk soft delete product yang sudah punya transaksi, apakah UI akan menampilkan label `inactive/deleted` atau hanya menyembunyikannya dari list default?
