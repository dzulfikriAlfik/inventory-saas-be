# 1. PRD — Inventory SaaS MVP

## Problem statement

Banyak bisnis kecil–menengah membutuhkan sistem inventory yang sederhana tetapi rapi untuk mencatat stok, pergerakan barang, dan histori perubahan stok. Solusi yang ada sering terlalu kompleks, mahal, atau tidak memiliki jejak audit yang jelas. Produk ini ditujukan sebagai **Inventory SaaS MVP** yang fokus pada kebutuhan inti: master data, stok saat ini, barang masuk, barang keluar, stock adjustment, dan histori stock movement per tenant.

## Target user

- Pemilik usaha kecil–menengah
- Admin operasional gudang
- Staf inventory / purchasing / fulfillment
- Bisnis dengan 1–beberapa gudang
- Tim kecil sekitar 2–20 user

## Goals

- Menyediakan SaaS multi-tenant untuk inventory management dasar.
- Memungkinkan tiap tenant memiliki data produk, gudang, supplier, customer, stok, dan transaksi sendiri.
- Menyediakan model stok yang aman dan bisa diaudit.
- Memisahkan **draft document** dan **posted document**.
- Menyediakan autentikasi aman dengan JWT melalui `HttpOnly cookie`.
- Menyediakan RBAC sederhana: `OWNER`, `ADMIN`, `STAFF`.
- Menjadi fondasi yang bisa dikembangkan ke modul lebih kompleks di fase berikutnya.
- Menyediakan OpenAPI sejak awal sebagai kontrak API awal.
- Menyediakan unit test dan integration test sejak awal.

## Non-goals

Fitur berikut **tidak masuk MVP**:

- Purchase Order
- Sales Order
- `reserved_quantity`
- Stock transfer antar gudang
- Invoice dan payment
- Subscription billing
- Batch / lot / serial number
- Expiry date tracking
- Akuntansi / general ledger keuangan
- Advanced analytics
- Full audit log di semua action non-stock
- Multi-language / i18n
- Offline mode
- Contract test penuh (akan dibuat setelah MVP stabil)

## MVP scope

### Core SaaS
- Register tenant baru
- Login / logout / refresh session
- Organisasi / workspace tenant
- Membership per organization
- Role-based access control

### Master data
- Products
- Warehouses
- Suppliers
- Customers

### Inventory
- Current stock per product per warehouse
- Stock movement ledger
- Purchase receipts
- Sales shipments
- Stock adjustments

### UI minimum
- Login page
- Dashboard summary
- Master data CRUD pages
- Current stocks page
- Stock movements page
- Purchase receipts page
- Sales shipments page
- Stock adjustments page
- Team members page

## Success metrics

### Product metrics
- Tenant bisa register dan langsung membuat organization sendiri.
- Tenant bisa membuat produk dan gudang.
- Tenant bisa mencatat barang masuk, barang keluar, dan adjustment.
- Tenant bisa melihat current stock yang sesuai dengan histori movement.
- Semua data tenant terisolasi berdasarkan `organizationId`.

### Engineering metrics
- Endpoint posting transaksi bersifat aman terhadap double posting berdasarkan status dokumen.
- Tidak ada stok negatif karena race condition pada shipment posting.
- Semua protected route membutuhkan auth + organization context.
- Semua operasi stok penting berjalan dalam database transaction.
- OpenAPI tersedia sejak awal dan selalu diperbarui saat endpoint bertambah.
- Unit test dan integration test tersedia sejak awal untuk modul kritikal.

## Product decisions already fixed

- Satu user **tidak bisa** menjadi member di banyak organization pada MVP.
- Tenant aktif akan dikirim di JWT payload sebagai `organizationId`.
- Refresh token disimpan di tabel `Session` dalam bentuk hash.
- Access token TTL = **1 day**.
- Refresh token TTL = **1 week**.
- FE dan BE production ada di subdomain berbeda:
  - FE: `inventory.pintarware.com`
  - BE: `inventory-be.pintarware.com`
- Soft delete dipakai sejak MVP.
- Nomor dokumen dibuat di app layer.
- Uniqueness nomor dokumen per organization sudah cukup untuk MVP.
- Dashboard MVP hanya menampilkan:
  - total products
  - total warehouses
- Audit fields transaksi:
  - `createdByUserId`
  - `postedByUserId`
- Dokumen `CANCELLED` hanya berlaku untuk dokumen yang masih draft.
- Environment dipisah untuk:
  - development
  - test
  - production

## Recommendation on active tenant in JWT

Karena pada MVP satu user hanya berada di satu organization, menyimpan `organizationId` di payload JWT adalah pendekatan yang **baik dan sederhana**.

### Kenapa ini cocok untuk MVP
- Tidak perlu mekanisme pilih organization aktif.
- Middleware backend lebih sederhana.
- Query tenant-scoped jadi lebih mudah dan konsisten.

### Catatan untuk masa depan
Kalau nanti user bisa bergabung ke banyak organization, pendekatan ini harus diubah. Saat itu, organization aktif lebih baik dipilih dari header, subdomain, atau session context terpisah.

## Recommendation on product unit

Untuk MVP, rekomendasi terbaik adalah **menyimpan `unit` sebagai string langsung di tabel `Product`**, misalnya `PCS`, `BOX`, `KG`, `LITER`.

### Alasan
- Scope lebih kecil.
- Tidak perlu CRUD tambahan untuk master unit.
- Lebih cepat dibangun.
- Cukup untuk MVP inventory dasar.

### Guardrail yang disarankan
- Validasi di backend dengan daftar unit yang diizinkan, atau minimal format uppercase yang konsisten.
- Jangan dulu buat tabel `Unit` kecuali kebutuhan bisnis benar-benar muncul.

### Upgrade path nanti
Jika produk berkembang dan butuh konversi unit, baru buat master `Unit` dan relasi turunannya.

## Open questions

- Apakah daftar unit di MVP akan benar-benar dibatasi (`PCS`, `BOX`, `KG`, dll.) atau sementara bebas tetapi dinormalisasi uppercase?
- Apakah register tenant akan langsung membuat organization slug otomatis dari nama organization?
- Apakah owner boleh melakukan soft delete pada product yang sudah punya transaksi, atau cukup dinonaktifkan saja?
