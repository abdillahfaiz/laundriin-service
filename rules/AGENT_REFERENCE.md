# 🤖 Laundriin Service — AI Agent Reference

> Dokumen ini adalah referensi lengkap untuk AI Agent yang mengerjakan backend Laundriin Service.
> Dibuat berdasarkan semua diskusi, keputusan desain, dan analisis schema yang telah dilakukan.
> **Selalu baca dokumen ini sebelum membuat atau memodifikasi kode apapun.**

---

## 📋 Daftar Isi

1. [Stack & Struktur Proyek](#1-stack--struktur-proyek)
2. [Schema Database (Final v3)](#2-schema-database-final-v3)
3. [Enum & Konstanta](#3-enum--konstanta)
4. [Business Rules Kritis](#4-business-rules-kritis)
5. [Flow Status Order](#5-flow-status-order)
6. [Struktur API Endpoint](#6-struktur-api-endpoint)
7. [Auth & Security](#7-auth--security)
8. [Kalkulasi Harga](#8-kalkulasi-harga)
9. [Integrasi Midtrans](#9-integrasi-midtrans)
10. [Fitur Antar Jemput](#10-fitur-antar-jemput)
11. [Format Response Standar](#11-format-response-standar)
12. [Aturan Validasi Zod](#12-aturan-validasi-zod)
13. [Hal yang DILARANG](#13-hal-yang-dilarang)

---

## 1. Stack & Struktur Proyek

```
Node.js 20+ · TypeScript (strict) · Express · Prisma · PostgreSQL
Cloudinary (foto) · Midtrans Core API via axios · Firebase FCM
```

### Struktur Folder

```
src/
├── app.ts                    # Express setup, middleware order
├── server.ts                 # Entry point
├── prisma/
│   └── client.ts             # Prisma singleton
├── middlewares/
│   ├── auth.middleware.ts     # JWT verify + role check
│   ├── error.middleware.ts    # Global error handler
│   └── upload.middleware.ts   # Cloudinary multer
├── modules/
│   ├── auth/
│   ├── customer/
│   ├── outlet/               # Admin outlet + kasir
│   ├── superadmin/
│   └── webhook/
└── utils/
    ├── response.ts           # Standar response helper
    ├── haversine.ts          # Distance calculation
    ├── qrcode.ts             # QR generate/verify
    └── midtrans.ts           # Midtrans API wrapper
```

### Middleware Order di app.ts (WAJIB urutan ini)

```typescript
app.use(helmet())
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') }))
app.use(express.json({ limit: '10mb' }))
app.use(hpp())
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }))
// ... routes
app.use(errorMiddleware)
```

---

## 2. Schema Database (Final v3)

> ⚠️ **PENTING:** Schema ini adalah versi FINAL yang sudah disetujui. Jangan ubah struktur tanpa konfirmasi.

### Perubahan dari v2 → v3

| Yang Dihapus | Alasan |
|---|---|
| `ItemJenisLayanan` (junction table) | Diganti `JenisPerItem` yang lebih eksplisit |
| `ItemHarga` | Diganti `DurasiPerItem` |
| `JenisLayanan.tipe` (field) | `JenisLayanan` kini HANYA untuk Per KG |
| `DurasiLayanan.outlet_id` (field) | Redundant, cukup via `jenis_layanan.outlet_id` |
| `Order.berat_estimasi` (field) | Tidak pernah dipakai di flow manapun |

| Yang Ditambahkan | Keterangan |
|---|---|
| `JenisPerItem` | Jenis layanan MILIK satu item (bukan shared) |
| `DurasiPerItem` | Durasi + harga untuk setiap JenisPerItem |
| `OrderPickup` | Data pickup untuk order antar jemput |
| `OutletCoverage` | Area jangkauan antar jemput per outlet |
| `Order.tipe_layanan` (field) | Eksplisit `per_kg` atau `per_item` |
| `Order.jenis_order` (field) | Eksplisit `drop_and_go` atau `antar_jemput` |
| `OrderItem.jenis_per_item_id` | Foreign key ke JenisPerItem |
| `OrderItem.durasi_per_item_id` | Foreign key ke DurasiPerItem |
| `OrderItem.harga_satuan` | Price snapshot saat order dibuat |
| `OrderItem.subtotal` | `qty × harga_satuan` |

### Diagram Relasi Per Item (Baru)

```
ItemLayanan
  └── JenisPerItem[]          ← MILIK item ini (bukan shared)
        └── DurasiPerItem[]   ← durasi + harga per jenis
              └── OrderItem[] ← referensi saat customer pesan
```

### Diagram Relasi Per KG (Tidak Berubah)

```
JenisLayanan
  └── DurasiLayanan[]         ← nama + estimasi_jam + harga/kg
        └── Order[]           ← referensi saat customer pesan
```

---

## 3. Enum & Konstanta

```typescript
// Role user
enum Role { customer, kasir, admin_outlet, superadmin }

// Status outlet
enum OutletStatus { pending, aktif, nonaktif }

// Tipe layanan order
enum TipeLayanan { per_kg, per_item }

// Jenis order
enum JenisOrder { drop_and_go, antar_jemput }

// Status order — DROP & GO flow
// menunggu_drop → menunggu_ditimbang → sedang_diproses → siap_diambil → selesai
// ⚠️  Payment bisa dilakukan kapan saja setelah ditimbang, TIDAK memblokir proses laundry
// ⚠️  Gate payment ada di transisi siap_diambil → selesai (kasir cek payment sebelum serahkan)

// Status order — ANTAR JEMPUT flow
// menunggu_konfirmasi → dikonfirmasi → kurir_menuju → barang_dijemput
// → menunggu_ditimbang → sedang_diproses → siap_diantar → sedang_diantar → selesai
// ⚠️  Untuk antar jemput: gate payment ada di barang_dijemput → menunggu_ditimbang (sudah ditimbang)
//     dan delivery (siap_diantar → sedang_diantar) tetap butuh payment settlement

enum OrderStatus {
  // shared
  menunggu_ditimbang    // setelah drop/dijemput, tagihan muncul, user bisa bayar kapan saja
  sedang_diproses
  selesai
  dibatalkan
  // drop & go only
  menunggu_drop
  siap_diambil
  // antar jemput only
  menunggu_konfirmasi
  dikonfirmasi
  kurir_menuju
  barang_dijemput
  siap_diantar
  sedang_diantar
}

enum PaymentStatus { pending, settlement, expire, cancel, deny }
enum PencairanStatus { pending, diproses, berhasil, ditolak }
enum NotifikasiTipe { tagihan, status_order, pembayaran, pencairan }
enum SaldoTipe { kredit, debit }
enum HariEnum { senin, selasa, rabu, kamis, jumat, sabtu, minggu }
```

### Format QR Code

```
TRX-{YYYYMMDD}-{6 karakter alphanumeric uppercase}
Contoh: TRX-20250610-A3X9KL
```

### Format transaction_id (sama dengan QR code value)

```typescript
const generateTransactionId = (): string => {
  const date = format(new Date(), 'yyyyMMdd')
  const random = randomBytes(3).toString('hex').toUpperCase().slice(0, 6)
  return `TRX-${date}-${random}`
}
```

---

## 4. Business Rules Kritis

> ❌ = DILARANG KERAS | ✅ = WAJIB DILAKUKAN

### Auth

- ✅ Password hash: `bcrypt` dengan `saltRounds: 12`
- ✅ JWT access token: expire `15 menit`
- ✅ JWT refresh token: expire `7 hari`
- ✅ JWT payload berisi: `{ userId, role, outletId? }`
- ❌ Jangan simpan token di database (kecuali refresh token untuk revoke)

### Order Per KG

- ✅ Harga dihitung: `berat_aktual × harga_per_kg + harga_parfum`
- ✅ `berat_aktual` diinput kasir saat customer drop barang
- ✅ Setelah timbang → `total_harga_final` disimpan → status berubah ke `menunggu_ditimbang` → tagihan dikirim via FCM
- ✅ Kasir **langsung bisa** update ke `sedang_diproses` TANPA menunggu payment
- ✅ Customer bisa bayar kapan saja selama status bukan `selesai` atau `dibatalkan`
- ✅ **Gate payment ada di `siap_diambil → selesai`**: kasir WAJIB cek `payment.status === settlement` sebelum serahkan barang
- ✅ Jika payment belum `settlement` saat kasir klik selesai → tolak dengan pesan "Tagihan belum dibayar"
- ❌ Jangan blokir kasir dari update `sedang_diproses` hanya karena payment belum settlement
- ❌ Jangan hitung harga dari `berat_estimasi` (field ini tidak ada di schema v3)

### Order Per Item

- ✅ Setiap item di `order_items` WAJIB menyertakan `jenis_per_item_id` dan `durasi_per_item_id`
- ✅ `harga_satuan` di `OrderItem` adalah snapshot dari `DurasiPerItem.harga` saat order dibuat
- ✅ `subtotal` = `qty × harga_satuan`
- ✅ `total_harga_final` order = `SUM(order_items.subtotal) + harga_parfum`
- ✅ Walk-in per item: `total_harga_final` langsung diketahui → status langsung `menunggu_ditimbang` (tidak perlu timbang fisik)
- ✅ Customer bisa bayar kapan saja setelah status `menunggu_ditimbang`
- ✅ **Gate payment sama seperti Per KG**: kasir cek payment sebelum update ke `selesai`
- ❌ Jangan re-fetch harga dari DurasiPerItem saat payment (gunakan harga_satuan yg tersimpan)

### Coverage Antar Jemput

- ✅ Validasi coverage menggunakan **Haversine formula**
- ✅ Koordinat outlet dari `Outlet.lat` dan `Outlet.lng`
- ✅ Jika customer masuk **multiple coverage area** → ambil `ongkos_kirim` **termurah**
- ✅ `ongkos_kirim` di-lock ke `OrderPickup.ongkos_kirim` saat booking (tidak berubah)
- ❌ Jangan re-fetch ongkos_kirim dari OutletCoverage saat payment

### Antar Jemput — Jadwal

- ✅ `jadwal_jemput` minimum **2 jam** dari waktu booking
- ✅ `jadwal_jemput` tidak boleh di masa lampau
- ✅ `alamat_antar` default = `alamat_pickup` jika tidak diisi customer

### Antar Jemput — Foto

- ✅ `foto_barang_pickup` **WAJIB** diupload saat update status ke `barang_dijemput`
- ❌ Jangan izinkan update ke `barang_dijemput` tanpa foto

### Antar Jemput — Kurir

- ✅ `kurir_id` yang di-assign HARUS terdaftar di `OutletKasir` dengan `outlet_id` yang sama
- ✅ Kasir yang di-assign HARUS `is_active = true`
- ✅ Hanya kasir yang di-assign sebagai kurir yang bisa update status `kurir_menuju`

### Payment

- ✅ Gunakan **Midtrans Core API via axios** — BUKAN midtrans-client SDK
- ✅ Verifikasi webhook signature: `SHA512(order_id + status_code + gross_amount + server_key)`
- ✅ Saldo outlet bertambah **hanya** setelah payment status `settlement`
- ✅ Customer baru bisa membuat payment setelah `total_harga_final` terisi (status `menunggu_ditimbang` ke atas)
- ✅ **Drop & Go**: gate payment di `siap_diambil → selesai` — kasir cek `payment.status === settlement`
- ✅ **Antar Jemput**: gate payment di `siap_diantar → sedang_diantar` — delivery tidak boleh dimulai jika belum settlement
- ✅ UI dashboard kasir WAJIB menampilkan status payment saat order sudah `siap_diambil` atau `siap_diantar`
- ❌ Jangan proses status selain `settlement` sebagai pembayaran berhasil
- ❌ Jangan blokir kasir dari memproses laundry (update ke `sedang_diproses`) hanya karena belum bayar

### Saldo & Pencairan

- ✅ Pencairan hanya bisa diajukan jika tidak ada pencairan lain yang masih `pending` atau `diproses`
- ✅ Saldo di-hold (debit) saat pencairan diajukan
- ✅ Saldo dikembalikan jika pencairan `ditolak`
- ✅ Setiap perubahan saldo wajib dicatat di `SaldoLog`

---

## 5. Flow Status Order

### Drop & Go

```
[Customer booking] 
    ↓
menunggu_drop
    ↓ (kasir scan QR + input timbangan untuk per_kg, atau otomatis untuk per_item walk-in)
menunggu_ditimbang  ← tagihan muncul, customer BISA bayar kapan saja (tidak memblokir proses)
    ↓ (kasir langsung bisa update, TANPA tunggu payment settlement)
sedang_diproses
    ↓ (kasir update manual saat laundry selesai)
siap_diambil        ← ⚠️  KASIR WAJIB CEK payment.status sebelum serahkan barang
    ↓ (hanya bisa jika payment.status === 'settlement')
selesai
```

> **Catatan penting:**
> - Payment tidak memblokir alur kerja kasir sama sekali
> - Customer bisa bayar di status `menunggu_ditimbang`, `sedang_diproses`, atau `siap_diambil`
> - Satu-satunya tempat yang dicek: saat kasir mau update `siap_diambil → selesai`
> - UI dashboard tampilkan badge payment status (✅ Lunas / ⚠️ Belum Bayar) di halaman detail order

### Antar Jemput

```
[Customer booking + isi alamat & jadwal]
    ↓
menunggu_konfirmasi
    ↓ (admin outlet: PUT /pickup/konfirmasi + assign kurir_id)
dikonfirmasi
    ↓ (kasir/kurir: PUT /pickup/berangkat)
kurir_menuju
    ↓ (kasir/kurir: PUT /pickup/dijemput + WAJIB upload foto_barang_pickup)
barang_dijemput
    ↓ (kasir: input timbangan untuk per_kg / otomatis untuk per_item)
menunggu_ditimbang  ← tagihan muncul, customer BISA bayar kapan saja
    ↓ (kasir langsung bisa update, TANPA tunggu payment)
sedang_diproses
    ↓ (kasir update manual saat laundry selesai)
siap_diantar        ← ⚠️  KASIR WAJIB CEK payment.status sebelum kirim kurir
    ↓ (hanya bisa jika payment.status === 'settlement')
sedang_diantar
    ↓ (kasir/kurir: PUT /pickup/selesai-antar)
selesai
```

> **Catatan penting:**
> - Gate payment untuk antar jemput ada di `siap_diantar → sedang_diantar`
> - Logikanya: barang sudah jadi, kurir tidak boleh berangkat jika belum dibayar
> - Customer masih bisa bayar saat status `menunggu_ditimbang`, `sedang_diproses`, atau `siap_diantar`

### Transisi yang VALID

```typescript
const VALID_TRANSITIONS: Record<string, string[]> = {
  menunggu_drop:        ['menunggu_ditimbang', 'dibatalkan'],
  menunggu_konfirmasi:  ['dikonfirmasi', 'dibatalkan'],
  dikonfirmasi:         ['kurir_menuju', 'dibatalkan'],
  kurir_menuju:         ['barang_dijemput'],
  barang_dijemput:      ['menunggu_ditimbang'],
  menunggu_ditimbang:   ['sedang_diproses', 'dibatalkan'],  // kasir bebas proses tanpa cek payment
  sedang_diproses:      ['siap_diambil', 'siap_diantar'],
  siap_diambil:         ['selesai'],      // ⚠️ backend WAJIB validasi payment.status === 'settlement'
  siap_diantar:         ['sedang_diantar'], // ⚠️ backend WAJIB validasi payment.status === 'settlement'
  sedang_diantar:       ['selesai'],
  selesai:              [],
  dibatalkan:           [],
}

// Gate payment — implementasi di service layer:
const updateOrderStatus = async (orderId: string, newStatus: string) => {
  // Cek gate payment untuk Drop & Go
  if (newStatus === 'selesai') {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true }
    })
    if (order?.jenis_order === 'drop_and_go' && order.payment?.status !== 'settlement') {
      throw new Error('Tagihan belum dibayar. Minta customer melunasi sebelum barang diserahkan.')
    }
  }
  // Cek gate payment untuk Antar Jemput
  if (newStatus === 'sedang_diantar') {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true }
    })
    if (order?.payment?.status !== 'settlement') {
      throw new Error('Tagihan belum dibayar. Kurir tidak bisa dikirim sebelum customer melunasi.')
    }
  }
  // ... lanjutkan update status
}
```

---

## 6. Struktur API Endpoint

### Base URL: `/api/v1`

### 🔐 Auth (`/auth`)

| Method | Path | Role | Keterangan |
|--------|------|------|-----------|
| POST | `/register/customer` | Public | |
| POST | `/register/outlet` | Public | Status outlet default: `pending` |
| POST | `/login` | Public | Return accessToken + refreshToken |
| POST | `/refresh-token` | Public | |
| POST | `/logout` | Auth | |
| PUT | `/fcm-token` | Auth | Update Firebase FCM token |

### 👤 Customer — Outlet (`/customer`)

| Method | Path | Keterangan |
|--------|------|-----------|
| GET | `/outlets/nearby?lat=&lng=&radius=&page=&limit=` | Haversine, hanya outlet `aktif` |
| GET | `/outlets/:id` | Detail outlet + jam operasional |
| GET | `/outlets/:id/coverage?lat=&lng=` | Cek coverage + ongkos kirim |
| GET | `/outlets/:id/parfum` | Parfum aktif |
| GET | `/outlets/:id/layanan/per-kg` | Jenis layanan Per KG |
| GET | `/outlets/:id/layanan/per-kg/:jenisId/durasi` | Durasi + harga/kg |
| GET | `/outlets/:id/layanan/per-item/items` | Semua item aktif |
| GET | `/outlets/:id/layanan/per-item/items/:itemId/jenis` | Jenis per item |
| GET | `/outlets/:id/layanan/per-item/jenis/:jenisId/durasi` | Durasi + harga per jenis |

### 👤 Customer — Order

| Method | Path | Keterangan |
|--------|------|-----------|
| POST | `/orders` | Buat order (per_kg atau per_item, drop_and_go atau antar_jemput) |
| GET | `/orders/active` | Order yang belum selesai |
| GET | `/orders/history?page=&limit=` | Order selesai |
| GET | `/orders/:id` | Detail order |
| GET | `/orders/:id/qr` | QR code base64 |

### 👤 Customer — Payment

| Method | Path | Keterangan |
|--------|------|-----------|
| GET | `/orders/:id/tagihan` | Rincian tagihan |
| POST | `/orders/:id/payment` | Buat payment (pilih metode) |
| GET | `/orders/:id/payment` | Status payment |
| POST | `/orders/:id/payment/check` | Manual cek ke Midtrans |

### 🏪 Outlet — Orders (Role: `kasir` atau `admin_outlet`)

| Method | Path | Keterangan |
|--------|------|-----------|
| GET | `/outlet/orders?status=&tipe_layanan=&jenis_order=&page=&limit=` | |
| GET | `/outlet/orders/:id` | |
| POST | `/outlet/orders/scan` | `{ qr_code: "TRX-..." }` |
| PUT | `/outlet/orders/:id/timbang` | `{ berat_aktual, foto_timbangan }` — per_kg only |
| PUT | `/outlet/orders/:id/status` | `{ status, note? }` |
| POST | `/outlet/orders/walkin` | Walk-in (per_kg atau per_item) |
| GET | `/outlet/orders/pickup` | Daftar order antar jemput |
| PUT | `/outlet/orders/:id/pickup/konfirmasi` | `{ kurir_id }` — admin only |
| PUT | `/outlet/orders/:id/pickup/berangkat` | Hanya kurir yang di-assign |
| PUT | `/outlet/orders/:id/pickup/dijemput` | `{ foto_barang_pickup }` — WAJIB |
| PUT | `/outlet/orders/:id/pickup/diantar` | Requires `siap_diantar` |
| PUT | `/outlet/orders/:id/pickup/selesai-antar` | |

### 🏪 Outlet — Layanan Per KG

| Method | Path | Keterangan |
|--------|------|-----------|
| GET | `/outlet/layanan/per-kg/jenis` | |
| POST | `/outlet/layanan/per-kg/jenis` | `{ nama, deskripsi? }` — no `tipe` field |
| PUT | `/outlet/layanan/per-kg/jenis/:id` | |
| PUT | `/outlet/layanan/per-kg/jenis/:id/toggle` | |
| DELETE | `/outlet/layanan/per-kg/jenis/:id` | |
| GET | `/outlet/layanan/per-kg/jenis/:id/durasi` | |
| POST | `/outlet/layanan/per-kg/jenis/:id/durasi` | `{ nama, estimasi_jam, harga }` |
| PUT | `/outlet/layanan/per-kg/durasi/:id` | |
| PUT | `/outlet/layanan/per-kg/durasi/:id/toggle` | |
| DELETE | `/outlet/layanan/per-kg/durasi/:id` | |

### 🏪 Outlet — Layanan Per Item

| Method | Path | Keterangan |
|--------|------|-----------|
| GET | `/outlet/layanan/per-item/items` | |
| POST | `/outlet/layanan/per-item/items` | `{ nama_item, foto_item? }` — SEDERHANA |
| PUT | `/outlet/layanan/per-item/items/:id` | |
| PUT | `/outlet/layanan/per-item/items/:id/toggle` | |
| DELETE | `/outlet/layanan/per-item/items/:id` | |
| GET | `/outlet/layanan/per-item/items/:id/jenis` | |
| POST | `/outlet/layanan/per-item/items/:id/jenis` | `{ nama, deskripsi? }` |
| PUT | `/outlet/layanan/per-item/jenis/:id` | |
| PUT | `/outlet/layanan/per-item/jenis/:id/toggle` | |
| DELETE | `/outlet/layanan/per-item/jenis/:id` | |
| GET | `/outlet/layanan/per-item/jenis/:id/durasi` | |
| POST | `/outlet/layanan/per-item/jenis/:id/durasi` | `{ nama, estimasi_jam, harga }` |
| PUT | `/outlet/layanan/per-item/durasi/:id` | |
| PUT | `/outlet/layanan/per-item/durasi/:id/toggle` | |
| DELETE | `/outlet/layanan/per-item/durasi/:id` | |

### 🏪 Outlet — Lainnya

| Method | Path | Keterangan |
|--------|------|-----------|
| GET/POST/PUT/DELETE | `/outlet/layanan/parfum` | CRUD parfum |
| PUT | `/outlet/layanan/parfum/:id/toggle` | |
| GET/POST/PUT | `/outlet/kasir` | Manajemen kasir |
| PUT | `/outlet/kasir/:id/toggle` | |
| GET/PUT | `/outlet/profile` | Profil outlet |
| GET/PUT | `/outlet/operasional` | Jam operasional |
| GET/POST/PUT/DELETE | `/outlet/coverage` | Area coverage |
| PUT | `/outlet/coverage/:id/toggle` | |
| GET/POST | `/outlet/saldo` | Saldo + log |
| GET/POST/GET | `/outlet/saldo/pencairan` | Pencairan |
| GET | `/outlet/dashboard?periode=today\|week\|month` | |

### 🔱 Superadmin

| Method | Path | Keterangan |
|--------|------|-----------|
| GET | `/superadmin/dashboard` | |
| GET | `/superadmin/outlets` | |
| GET | `/superadmin/outlets/:id` | |
| PUT | `/superadmin/outlets/:id/status` | `{ status: aktif\|nonaktif }` |
| GET/GET/PUT | `/superadmin/pencairan` | List + detail + proses |
| GET/PUT | `/superadmin/users` | List + toggle |

### 🔔 Webhook

| Method | Path | Keterangan |
|--------|------|-----------|
| POST | `/webhook/midtrans` | Verifikasi signature dulu! |

---

## 7. Auth & Security

### JWT Middleware

```typescript
// Cara pakai di route
router.get('/orders', authenticate, authorize('kasir', 'admin_outlet'), handler)

// Isi req.user setelah authenticate
interface AuthUser {
  userId: string
  role: Role
  outletId?: string  // ada jika kasir atau admin_outlet
}
```

### Role Hierarchy

```
superadmin  → semua endpoint
admin_outlet → semua endpoint outlet (termasuk konfirmasi pickup)
kasir        → dashboard, order (scan/timbang/status), walkin
customer     → semua endpoint /customer/*
```

### Midtrans Webhook Signature Verification

```typescript
const verifyMidtransSignature = (
  orderId: string,
  statusCode: string,
  grossAmount: string,
  serverKey: string,
  receivedSignature: string
): boolean => {
  const raw = `${orderId}${statusCode}${grossAmount}${serverKey}`
  const computed = createHash('sha512').update(raw).digest('hex')
  return computed === receivedSignature
}
```

---

## 8. Kalkulasi Harga

### Per KG

```typescript
const hitungTotal = (berat: number, hargaPerKg: number, hargaParfum: number): number => {
  return (berat * hargaPerKg) + hargaParfum
}
```

### Per Item

```typescript
// Saat membuat OrderItem
const hargaSatuan = durasiPerItem.harga  // snapshot dari DB
const subtotal = qty * hargaSatuan

// Total order
const totalHarga = orderItems.reduce((sum, item) => sum + item.subtotal, 0) + (parfum?.harga ?? 0)
```

### Ongkos Kirim (Antar Jemput)

```typescript
// Haversine formula
const haversine = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371  // Radius bumi dalam km
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng/2)**2
  return R * 2 * Math.asin(Math.sqrt(a))
}

// Cari coverage yang berlaku dan ambil yang termurah
const getCoverage = async (outletId: string, customerLat: number, customerLng: number) => {
  const outlet = await prisma.outlet.findUnique({ where: { id: outletId } })
  const coverages = await prisma.outletCoverage.findMany({ 
    where: { outlet_id: outletId, is_active: true } 
  })
  
  const validCoverages = coverages.filter(c => {
    const dist = haversine(Number(outlet.lat), Number(outlet.lng), customerLat, customerLng)
    return dist <= c.max_radius_km
  })
  
  if (validCoverages.length === 0) throw new Error('Lokasi di luar jangkauan')
  
  // Ambil yang termurah
  return validCoverages.sort((a, b) => Number(a.ongkos_kirim) - Number(b.ongkos_kirim))[0]
}
```

---

## 9. Integrasi Midtrans

> ⚠️ Gunakan `axios` langsung — BUKAN `midtrans-client` SDK

### Buat Charge (Core API)

```typescript
const midtransCharge = async (payload: object) => {
  const response = await axios.post(
    `${process.env.MIDTRANS_BASE_URL}/v2/charge`,
    payload,
    {
      headers: {
        'Authorization': `Basic ${Buffer.from(process.env.MIDTRANS_SERVER_KEY + ':').toString('base64')}`,
        'Content-Type': 'application/json'
      }
    }
  )
  return response.data
}
```

### Environment Variables

```env
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxx  # Sandbox
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxx
MIDTRANS_BASE_URL=https://api.sandbox.midtrans.com  # Sandbox
# Production: https://api.midtrans.com
```

---

## 10. Fitur Antar Jemput

### Request Body Create Order Antar Jemput

```typescript
// Per KG + Antar Jemput
{
  outlet_id: string
  jenis_order: "antar_jemput"
  tipe_layanan: "per_kg"
  jenis_layanan_id: string
  durasi_layanan_id: string
  parfum_id?: string
  special_notes?: string
  pickup: {
    alamat_pickup: string
    lat_pickup: number
    lng_pickup: number
    alamat_antar?: string    // default = alamat_pickup
    lat_antar?: number
    lng_antar?: number
    jadwal_jemput: string    // ISO 8601, min +2 jam dari now
    catatan_alamat?: string
  }
}

// Per Item + Antar Jemput
{
  outlet_id: string
  jenis_order: "antar_jemput"
  tipe_layanan: "per_item"
  parfum_id?: string
  special_notes?: string
  items: [{
    item_layanan_id: string
    jenis_per_item_id: string
    durasi_per_item_id: string
    qty: number
  }]
  pickup: { ... }  // sama seperti di atas
}
```

### Validasi Jadwal

```typescript
const validateJadwal = (jadwalJemput: Date): void => {
  const now = new Date()
  const minJadwal = new Date(now.getTime() + 2 * 60 * 60 * 1000)  // +2 jam
  
  if (jadwalJemput < now) throw new Error('Jadwal tidak boleh di masa lampau')
  if (jadwalJemput < minJadwal) throw new Error('Jadwal minimal 2 jam dari sekarang')
}
```

---

## 11. Format Response Standar

### Success

```typescript
// Single data
{
  success: true,
  message: "Berhasil",
  data: { ... }
}

// List dengan pagination
{
  success: true,
  message: "Berhasil",
  data: [ ... ],
  pagination: {
    page: 1,
    limit: 20,
    total: 100,
    totalPages: 5
  }
}
```

### Error

```typescript
{
  success: false,
  message: "Pesan error yang jelas",
  errors?: [ ... ]  // Untuk validation errors
}
```

### HTTP Status Codes

| Kode | Kapan digunakan |
|------|----------------|
| 200 | Success GET / PUT |
| 201 | Success POST (resource dibuat) |
| 400 | Validasi gagal / bad request |
| 401 | Tidak ada token / token invalid |
| 403 | Token valid tapi role tidak izin |
| 404 | Resource tidak ditemukan |
| 409 | Conflict (duplikat, status tidak valid) |
| 500 | Internal server error |

---

## 12. Aturan Validasi Zod

### Create Order Per Item

```typescript
const createOrderPerItemSchema = z.object({
  outlet_id: z.string().uuid(),
  jenis_order: z.enum(['drop_and_go', 'antar_jemput']),
  tipe_layanan: z.literal('per_item'),
  parfum_id: z.string().uuid().optional(),
  special_notes: z.string().max(500).optional(),
  items: z.array(z.object({
    item_layanan_id: z.string().uuid(),
    jenis_per_item_id: z.string().uuid(),  // WAJIB
    durasi_per_item_id: z.string().uuid(), // WAJIB
    qty: z.number().int().min(1).max(100)
  })).min(1),
  pickup: z.object({
    alamat_pickup: z.string().min(10),
    lat_pickup: z.number().min(-90).max(90),
    lng_pickup: z.number().min(-180).max(180),
    alamat_antar: z.string().optional(),
    lat_antar: z.number().optional(),
    lng_antar: z.number().optional(),
    jadwal_jemput: z.string().datetime(),
    catatan_alamat: z.string().max(200).optional()
  }).optional()  // required hanya jika jenis_order === 'antar_jemput'
})
```

### Create Jenis Layanan Per KG

```typescript
const createJenisLayananSchema = z.object({
  nama: z.string().min(3).max(100),
  deskripsi: z.string().max(500).optional()
  // TIDAK ADA field 'tipe' — sudah implisit per_kg
})
```

---

## 13. Hal yang DILARANG

> Semua poin di bawah adalah KESALAHAN KRITIS yang TIDAK BOLEH dilakukan.

1. ❌ **Jangan install `midtrans-client` SDK** — gunakan `axios` langsung
2. ❌ **Jangan buat field `tipe` di `JenisLayanan`** — sudah dihapus di v3
3. ❌ **Jangan buat `ItemJenisLayanan` atau `ItemHarga`** — sudah diganti dengan `JenisPerItem` dan `DurasiPerItem`
4. ❌ **Jangan re-fetch harga dari DurasiPerItem/DurasiLayanan saat payment** — selalu gunakan snapshot di `harga_satuan`
5. ❌ **Jangan re-fetch ongkos_kirim dari OutletCoverage saat payment** — gunakan `OrderPickup.ongkos_kirim`
6. ❌ **Jangan izinkan status order loncat** — selalu validasi lewat `VALID_TRANSITIONS`
7. ❌ **Jangan izinkan `barang_dijemput` tanpa `foto_barang_pickup`**
8. ❌ **Jangan blokir kasir dari update `sedang_diproses` hanya karena payment belum settlement** — gate payment hanya ada di `siap_diambil→selesai` (Drop & Go) dan `siap_diantar→sedang_diantar` (Antar Jemput)
9. ❌ **Jangan buat `outlet_id` di `DurasiLayanan`** — cukup lewat relasi `jenis_layanan.outlet_id`
10. ❌ **Jangan buat `berat_estimasi` di Order** — field ini tidak ada di schema v3
11. ❌ **Jangan pakai `menunggu_pembayaran` di `OrderStatus`** — yang benar adalah `menunggu_ditimbang`
12. ❌ **Jangan buat kasir baru sebagai role** — kurir antar jemput adalah kasir existing yang di-assign
13. ❌ **Jangan izinkan customer membuat payment jika `total_harga_final` masih null** — payment hanya tersedia setelah status `menunggu_ditimbang`
