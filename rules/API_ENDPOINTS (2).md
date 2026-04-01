# API ENDPOINTS — Laundry Drop & Go
**Base URL:** `/api/v1`  
**Auth:** Bearer JWT Token  
**Roles:** `customer` | `kasir` | `admin_outlet` | `superadmin`

---

## 🔐 AUTH MODULE
> Public — tidak perlu token

| Method | Endpoint | Role | Deskripsi |
|--------|----------|------|-----------|
| POST | `/auth/register/customer` | Public | Register customer baru |
| POST | `/auth/register/outlet` | Public | Register outlet baru |
| POST | `/auth/login` | Public | Login semua role |
| POST | `/auth/refresh-token` | Public | Refresh JWT token |
| POST | `/auth/logout` | All | Logout & invalidate token |
| PUT | `/auth/fcm-token` | All | Update FCM token untuk push notif |

### Request Bodies

**POST /auth/register/customer**
```json
{
  "nama": "Budi Santoso",
  "nomor_telepon": "08123456789",
  "password": "password123"
}
```

**POST /auth/register/outlet**
```json
{
  "nama_outlet": "Laundry Amanah",
  "alamat": "Jl. Raya Baleendah No. 10",
  "foto_outlet": "base64_or_url",
  "lat": -6.9824,
  "lng": 107.6301,
  "nama_pemilik": "Ahmad",
  "nomor_telepon": "08129999999",
  "password": "password123"
}
```

**POST /auth/login**
```json
{
  "nomor_telepon": "08123456789",
  "password": "password123"
}
```

---

## 👤 CUSTOMER MODULE

### 1. Profile
| Method | Endpoint | Role | Deskripsi |
|--------|----------|------|-----------|
| GET | `/customer/profile` | customer | Get profil customer |
| PUT | `/customer/profile` | customer | Update nama & nomor telepon |
| PUT | `/customer/profile/password` | customer | Ganti password |

### 2. Outlet Discovery
| Method | Endpoint | Role | Deskripsi |
|--------|----------|------|-----------|
| GET | `/customer/outlets/nearby` | customer | Get outlet terdekat berdasarkan lat/lng customer (Haversine, diurutkan dari terdekat) |
| GET | `/customer/outlets/:id` | customer | Detail outlet + jam operasional |
| GET | `/customer/outlets/:id/layanan` | customer | List semua jenis layanan aktif di outlet |
| GET | `/customer/outlets/:id/durasi/:jenis_layanan_id` | customer | List durasi + harga per jenis layanan |
| GET | `/customer/outlets/:id/items/:jenis_layanan_id` | customer | List item layanan beserta harga per durasi (tipe per_item) |
| GET | `/customer/outlets/:id/parfum` | customer | List parfum aktif + harga |

**Query Params GET /customer/outlets/nearby:**
```
?lat=-6.9824&lng=107.6301&radius=10&page=1&limit=10
```
> `radius` dalam satuan kilometer, default 10km  
> Response include field `jarak_km` dan `is_buka` (berdasarkan jam operasional hari ini)

### 3. Booking / Order
| Method | Endpoint | Role | Deskripsi |
|--------|----------|------|-----------|
| POST | `/customer/orders` | customer | Buat booking baru |
| GET | `/customer/orders/active` | customer | List order aktif untuk home dashboard |
| GET | `/customer/orders/history` | customer | List riwayat order selesai/batal |
| GET | `/customer/orders/:id` | customer | Detail order + tracking status |
| GET | `/customer/orders/:id/qr` | customer | Ambil QR code order |

**POST /customer/orders — Per KG:**
```json
{
  "outlet_id": "uuid",
  "tipe_layanan": "per_kg",
  "jenis_layanan_id": "uuid",
  "durasi_layanan_id": "uuid",
  "parfum_id": "uuid",
  "special_notes": "Jangan pakai pewangi terlalu banyak"
}
```
> ⚠️ Tidak ada `berat_estimasi` — berat ditimbang langsung oleh kasir saat drop

**POST /customer/orders — Per Item:**
```json
{
  "outlet_id": "uuid",
  "tipe_layanan": "per_item",
  "parfum_id": "uuid",
  "special_notes": "Hati-hati bantal bulu",
  "items": [
    {
      "item_layanan_id": "uuid",
      "durasi_layanan_id": "uuid",
      "qty": 2
    },
    {
      "item_layanan_id": "uuid",
      "durasi_layanan_id": "uuid",
      "qty": 1
    }
  ]
}
```
> Untuk per_item, `total_harga_final` langsung bisa dihitung dari awal (qty × harga_satuan)

### 4. Payment
| Method | Endpoint | Role | Deskripsi |
|--------|----------|------|-----------|
| GET | `/customer/orders/:id/tagihan` | customer | Lihat detail tagihan setelah kasir input berat |
| POST | `/customer/orders/:id/payment` | customer | Buat transaksi pembayaran ke Midtrans |
| GET | `/customer/orders/:id/payment` | customer | Detail pembayaran (VA/QRIS, status, expire) |
| POST | `/customer/orders/:id/payment/check` | customer | Cek status pembayaran ke Midtrans |

**POST /customer/orders/:id/payment:**
```json
{
  "metode_pembayaran": "bca_va"
}
```
> ⚠️ Customer hanya kirim metode pembayaran. `total_harga_final` diambil otomatis dari DB (field `orders.total_harga_final`) — customer tidak bisa manipulasi nominal.

> Opsi `metode_pembayaran`: `bca_va` | `bni_va` | `bri_va` | `mandiri_va` | `qris` | `gopay` | `shopeepay`

### 5. Notifikasi
| Method | Endpoint | Role | Deskripsi |
|--------|----------|------|-----------|
| GET | `/customer/notifications` | customer | List notifikasi customer |
| PUT | `/customer/notifications/:id/read` | customer | Tandai notifikasi sudah dibaca |
| PUT | `/customer/notifications/read-all` | customer | Tandai semua sudah dibaca |

---

## 🏪 OUTLET / KASIR MODULE

### 1. Dashboard
| Method | Endpoint | Role | Deskripsi |
|--------|----------|------|-----------|
| GET | `/outlet/dashboard` | admin_outlet, kasir | Summary: total order, saldo, count per status |

**Query Params:** `?periode=today|week|month`

**Response:**
```json
{
  "total_order": 150,
  "new_order": 5,
  "completed_order": 120,
  "total_transaksi": 4500000,
  "saldo": 4500000
}
```

### 2. Order Management
| Method | Endpoint | Role | Deskripsi |
|--------|----------|------|-----------|
| GET | `/outlet/orders` | admin_outlet, kasir | List order by status dengan filter |
| GET | `/outlet/orders/:id` | admin_outlet, kasir | Detail order lengkap |
| POST | `/outlet/orders/scan` | kasir | Scan QR code → return detail order |
| PUT | `/outlet/orders/:id/timbang` | kasir | Input berat aktual + foto timbangan → trigger notif tagihan ke customer |
| PUT | `/outlet/orders/:id/status` | kasir | Update status order → trigger notif ke customer |
| POST | `/outlet/orders/walkin` | kasir | Buat order walk-in manual |

**Query Params GET /outlet/orders:**
```
?status=menunggu_drop|menunggu_pembayaran|sedang_diproses|siap_diambil|selesai
&page=1&limit=20&date=2025-01-01
```

**POST /outlet/orders/scan:**
```json
{ "qr_code": "TRX-20250101-XXXX" }
```

**PUT /outlet/orders/:id/timbang:**
```json
{
  "berat_aktual": 3.8,
  "foto_timbangan": "base64_or_url"
}
```
> Sistem otomatis hitung: `total_harga_final = berat_aktual × harga_per_kg (dari durasi_layanan.harga)` + `parfum.harga`  
> Status order berubah: `menunggu_drop` → `menunggu_pembayaran`  
> Push notifikasi dikirim ke customer berisi detail tagihan

**PUT /outlet/orders/:id/status:**
```json
{
  "status": "sedang_diproses",
  "note": "Sedang dalam antrian pencucian"
}
```

**POST /outlet/orders/walkin:**
```json
{
  "customer_nama": "Budi",
  "customer_telepon": "08123456789",
  "tipe_layanan": "per_kg",
  "jenis_layanan_id": "uuid",
  "durasi_layanan_id": "uuid",
  "parfum_id": "uuid",
  "berat_aktual": 4.2,
  "foto_timbangan": "base64_or_url",
  "special_notes": "notes"
}
```

### 3. Setup Jenis Layanan
| Method | Endpoint | Role | Deskripsi |
|--------|----------|------|-----------|
| GET | `/outlet/layanan/jenis` | admin_outlet | List jenis layanan |
| POST | `/outlet/layanan/jenis` | admin_outlet | Tambah jenis layanan |
| PUT | `/outlet/layanan/jenis/:id` | admin_outlet | Edit jenis layanan |
| DELETE | `/outlet/layanan/jenis/:id` | admin_outlet | Nonaktifkan jenis layanan |

### 4. Setup Durasi Layanan
| Method | Endpoint | Role | Deskripsi |
|--------|----------|------|-----------|
| GET | `/outlet/layanan/durasi` | admin_outlet | List durasi (filter by jenis_layanan_id) |
| POST | `/outlet/layanan/durasi` | admin_outlet | Tambah durasi + harga per kg |
| PUT | `/outlet/layanan/durasi/:id` | admin_outlet | Edit durasi |
| DELETE | `/outlet/layanan/durasi/:id` | admin_outlet | Nonaktifkan durasi |

**POST /outlet/layanan/durasi:**
```json
{
  "jenis_layanan_id": "uuid",
  "nama": "Express",
  "estimasi_jam": 8,
  "harga": 8000
}
```

### 5. Setup Item Layanan
| Method | Endpoint | Role | Deskripsi |
|--------|----------|------|-----------|
| GET | `/outlet/layanan/items` | admin_outlet | List item layanan |
| POST | `/outlet/layanan/items` | admin_outlet | Tambah item |
| PUT | `/outlet/layanan/items/:id` | admin_outlet | Edit item |
| DELETE | `/outlet/layanan/items/:id` | admin_outlet | Nonaktifkan item |
| POST | `/outlet/layanan/items/:id/harga` | admin_outlet | Set harga item per durasi (bulk) |
| PUT | `/outlet/layanan/items/:id/harga/:durasi_id` | admin_outlet | Update harga item per durasi |

### 6. Setup Parfum
| Method | Endpoint | Role | Deskripsi |
|--------|----------|------|-----------|
| GET | `/outlet/parfum` | admin_outlet | List parfum |
| POST | `/outlet/parfum` | admin_outlet | Tambah parfum + harga |
| PUT | `/outlet/parfum/:id` | admin_outlet | Edit parfum |
| DELETE | `/outlet/parfum/:id` | admin_outlet | Nonaktifkan parfum |

### 7. Manajemen Kasir
| Method | Endpoint | Role | Deskripsi |
|--------|----------|------|-----------|
| GET | `/outlet/kasir` | admin_outlet | List kasir outlet |
| POST | `/outlet/kasir` | admin_outlet | Tambah akun kasir |
| PUT | `/outlet/kasir/:id` | admin_outlet | Edit kasir |
| PUT | `/outlet/kasir/:id/toggle` | admin_outlet | Aktif / nonaktifkan kasir |

### 8. Manajemen Outlet
| Method | Endpoint | Role | Deskripsi |
|--------|----------|------|-----------|
| GET | `/outlet/profile` | admin_outlet | Get profil outlet |
| PUT | `/outlet/profile` | admin_outlet | Edit profil outlet |
| GET | `/outlet/operasional` | admin_outlet | Get jam operasional |
| PUT | `/outlet/operasional` | admin_outlet | Update jam operasional semua hari |

### 9. Saldo & Pencairan
| Method | Endpoint | Role | Deskripsi |
|--------|----------|------|-----------|
| GET | `/outlet/saldo` | admin_outlet | Cek saldo tersedia |
| GET | `/outlet/saldo/log` | admin_outlet | Riwayat kredit/debit saldo |
| POST | `/outlet/saldo/pencairan` | admin_outlet | Request pencairan saldo |
| GET | `/outlet/saldo/pencairan` | admin_outlet | List riwayat request pencairan |
| GET | `/outlet/saldo/pencairan/:id` | admin_outlet | Detail request + bukti transfer |

**POST /outlet/saldo/pencairan:**
```json
{
  "jumlah": 500000,
  "nomor_rekening": "1234567890",
  "nama_pemilik_rekening": "Ahmad Pemilik",
  "bank_tujuan": "BCA"
}
```

---

## 🔱 SUPERADMIN MODULE

### 1. Dashboard
| Method | Endpoint | Role | Deskripsi |
|--------|----------|------|-----------|
| GET | `/superadmin/dashboard` | superadmin | Summary semua outlet, total order, transaksi |

### 2. Manajemen Outlet
| Method | Endpoint | Role | Deskripsi |
|--------|----------|------|-----------|
| GET | `/superadmin/outlets` | superadmin | List semua outlet + status |
| GET | `/superadmin/outlets/:id` | superadmin | Detail outlet |
| PUT | `/superadmin/outlets/:id/status` | superadmin | Approve / suspend outlet |

### 3. Manajemen Pencairan
| Method | Endpoint | Role | Deskripsi |
|--------|----------|------|-----------|
| GET | `/superadmin/pencairan` | superadmin | List semua request pencairan |
| GET | `/superadmin/pencairan/:id` | superadmin | Detail request pencairan |
| PUT | `/superadmin/pencairan/:id/proses` | superadmin | Update status + upload bukti transfer |

**PUT /superadmin/pencairan/:id/proses:**
```json
{
  "status": "berhasil",
  "bukti_transfer": "base64_or_url",
  "catatan_admin": "Transfer sudah dilakukan"
}
```

### 4. Manajemen User
| Method | Endpoint | Role | Deskripsi |
|--------|----------|------|-----------|
| GET | `/superadmin/users` | superadmin | List semua user |
| PUT | `/superadmin/users/:id/toggle` | superadmin | Aktif / nonaktifkan user |

---

## 🔔 WEBHOOK

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/webhook/midtrans` | Callback notifikasi status payment dari Midtrans |

**Midtrans Webhook Logic:**
```
1. Terima payload dari Midtrans
2. Verifikasi signature: SHA512(order_id + status_code + gross_amount + server_key)
3. Jika status = "settlement":
   - Update payments.status = settlement
   - Update orders.status = sedang_diproses
   - Tambah saldo outlet += total_harga_final
   - Catat saldo_log (kredit)
   - Kirim push notif ke customer: "Pembayaran berhasil"
4. Jika status = "expire" atau "cancel":
   - Update payments.status
   - Update orders.status = dibatalkan
   - Kirim push notif ke customer
```

---

## 📦 STANDARD RESPONSE FORMAT

**Success:**
```json
{
  "success": true,
  "message": "Berhasil",
  "data": { }
}
```

**Paginated:**
```json
{
  "success": true,
  "data": [ ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "total_pages": 10
  }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Pesan error",
  "errors": [ ]
}
```

---

## 📊 TOTAL ENDPOINT SUMMARY

| Module | Jumlah Endpoint |
|--------|----------------|
| Auth | 6 |
| Customer | 19 |
| Outlet / Kasir | 35 |
| Superadmin | 8 |
| Webhook | 1 |
| **TOTAL** | **69** |
