# 3. Implementation Plan — Inventory SaaS MVP

## Urutan build paling aman

Bangun sistem dalam urutan ini:

1. Backend foundation
2. Auth + tenancy
3. OpenAPI + test harness
4. Master data
5. Current stock + stock movement read model
6. Purchase receipt posting
7. Sales shipment posting
8. Stock adjustment posting
9. Frontend pages
10. Dashboard + hardening

---

## Milestone 1 — Backend foundation

### Scope
- Setup Express + TypeScript
- Setup Prisma + PostgreSQL
- Setup env loader untuk dev/test/prod
- Setup lint/test base
- Setup OpenAPI base
- Setup error handling dan validation base

### Acceptance criteria
- Backend server jalan di local.
- Prisma migrate bisa jalan.
- Ada config env terpisah untuk dev/test/prod.
- Endpoint health check tersedia.
- Swagger/OpenAPI page bisa dibuka.
- Unit test dan integration test base bisa dijalankan.

---

## Milestone 2 — Auth + multi-tenancy

### Scope
- `User`, `Session`, `Organization`, `Membership`
- Register
- Login
- Refresh
- Logout
- Me
- JWT access + refresh di HttpOnly cookie
- `organizationId` masuk ke JWT payload
- Auth middleware
- Org middleware
- RBAC middleware

### Acceptance criteria
- Register membuat:
  - user
  - organization
  - membership role OWNER
- Login mengembalikan cookie access + refresh.
- `/auth/me` menampilkan user + organization aktif.
- Refresh token disimpan hash-nya di tabel `Session`.
- Logout me-revoke session.
- Semua protected route membaca user dari cookie.
- Semua protected route bisa membaca `organizationId` dari JWT payload.

---

## Milestone 3 — OpenAPI + testing harness

### Scope
- Dokumentasikan endpoint auth di OpenAPI
- Setup integration test auth
- Setup helper factory test
- Setup DB test isolation

### Acceptance criteria
- Register/login/me/refresh/logout tercakup di OpenAPI.
- Integration test auth berjalan otomatis.
- Test database terpisah dari dev dan prod.
- CI lokal minimal bisa menjalankan test auth.

---

## Milestone 4 — Master data

### Scope
- Products CRUD
- Warehouses CRUD
- Suppliers CRUD
- Customers CRUD
- Soft delete untuk semua master data
- Unique validation per organization
- OpenAPI docs untuk semua master data
- Test unit + integration untuk master data

### Acceptance criteria
- OWNER dan ADMIN bisa create/update/delete soft delete.
- STAFF minimal bisa read.
- Product pakai `unit` string.
- SKU unik per organization.
- Warehouse code unik per organization.
- Supplier code unik per organization.
- Customer code unik per organization.
- Record yang di-soft-delete tidak muncul di list default.

---

## Milestone 5 — Current stock dan stock movement read model

### Scope
- Endpoint list current stocks
- Endpoint list stock movements
- Filter dasar
- OpenAPI docs
- Tests

### Acceptance criteria
- User bisa melihat stok per product per warehouse.
- User bisa melihat histori movement.
- Semua query tenant-aware.
- Data soft-deleted tidak bocor ke list default.

---

## Milestone 6 — Purchase receipt posting

### Scope
- Create purchase receipt draft
- Update draft
- Add items
- Cancel draft
- Post receipt
- Update stock on post
- Create stock movement `IN`
- Set `createdByUserId` dan `postedByUserId`
- OpenAPI docs
- Tests

### Acceptance criteria
- Draft tidak mengubah stok.
- Post receipt menambah stok.
- Post receipt membuat stock movement `IN`.
- Receipt yang sudah `POSTED` tidak bisa diposting ulang.
- Receipt `CANCELLED` hanya bisa berasal dari draft.
- Semua perubahan stok dan movement terjadi dalam satu DB transaction.

---

## Milestone 7 — Sales shipment posting

### Scope
- Create shipment draft
- Update draft
- Add items
- Cancel draft
- Post shipment
- Validate stock sufficiency
- Row lock stock rows
- Reduce stock
- Create stock movement `OUT`
- OpenAPI docs
- Tests

### Acceptance criteria
- Draft tidak mengubah stok.
- Post shipment mengurangi stok.
- Post shipment membuat stock movement `OUT`.
- Tidak bisa post bila stok kurang.
- Row lock dipakai pada proses yang rentan race condition.
- Shipment yang sudah `POSTED` tidak bisa diposting ulang.
- Shipment `CANCELLED` hanya bisa berasal dari draft.

---

## Milestone 8 — Stock adjustment posting

### Scope
- Create adjustment draft
- Update draft
- Add items
- Cancel draft
- Post adjustment
- Adjustment up/down
- Create movement `ADJUSTMENT_IN` / `ADJUSTMENT_OUT`
- OpenAPI docs
- Tests

### Acceptance criteria
- Draft tidak mengubah stok.
- Adjustment positif menambah stok.
- Adjustment negatif mengurangi stok.
- Bila adjustment negatif membuat stok minus, request ditolak.
- Movement type sesuai arah adjustment.
- Adjustment yang sudah `POSTED` tidak bisa diposting ulang.

---

## Milestone 9 — Frontend foundation

### Scope
- Setup React + TypeScript + Vite
- Setup router
- Setup Axios `withCredentials: true`
- Setup TanStack Query
- Auth pages
- Protected routes
- Global layout

### Acceptance criteria
- User bisa login dari FE.
- FE bisa memanggil `/auth/me` menggunakan cookie.
- Protected route bekerja.
- Error auth tampil rapi.

---

## Milestone 10 — Frontend MVP pages

### Scope
- Products page
- Warehouses page
- Suppliers page
- Customers page
- Stocks page
- Stock movements page
- Purchase receipts page
- Sales shipments page
- Stock adjustments page
- Team members page

### Acceptance criteria
- Semua halaman inti bisa dipakai end-to-end.
- User dapat membuat draft transaksi dan mem-posting dari UI.
- Data setelah posting terlihat benar di halaman stocks dan movements.

---

## Milestone 11 — Dashboard + hardening

### Scope
- Dashboard summary
- Metrics:
  - total products
  - total warehouses
- Improve error handling
- Improve validation
- Audit field exposure di detail transaksi
- Final OpenAPI cleanup

### Acceptance criteria
- Dashboard menampilkan 2 metrik utama.
- OpenAPI sinkron dengan implementasi.
- Test coverage modul kritikal tersedia.
- Project siap untuk demo MVP end-to-end.

---

## Build order inside each module

Untuk setiap module backend, bangun dengan urutan berikut:

1. Prisma model / migration
2. Zod schema
3. Service
4. Controller
5. Route
6. OpenAPI doc
7. Unit test
8. Integration test

## High-risk areas to implement carefully

- Cookie auth lintas subdomain
- Soft delete + unique constraint
- Shipment posting dengan stock locking
- Status transition document
- Selalu filter `organizationId`

## Open questions

- Tool testing final akan pakai `vitest` atau `jest`?
- OpenAPI akan ditulis code-first atau YAML-first?
