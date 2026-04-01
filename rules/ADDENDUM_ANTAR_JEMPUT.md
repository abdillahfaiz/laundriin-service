# ADDENDUM: FITUR ANTAR JEMPUT
# Laundry Drop and Go - Extension Document
# Dokumen ini berisi semua perubahan dan penambahan untuk fitur Antar Jemput.
# Baca bersama dengan: schema.prisma, API_ENDPOINTS.md, BUSINESS_RULES.md, TECHNICAL_SPEC.md

---

## 1. RINGKASAN PERUBAHAN

| Kategori         | Perubahan                                              |
|------------------|--------------------------------------------------------|
| Tabel baru       | order_pickup, outlet_coverage                          |
| Field baru       | orders.jenis_order (ENUM)                              |
| Enum baru        | JenisOrder, StatusPickup                               |
| Role baru        | TIDAK ADA - kurir = kasir yang sudah ada               |
| Status baru      | 5 status tambahan khusus antar jemput                  |
| Endpoint baru    | 11 endpoint                                            |
| Notifikasi baru  | 4 trigger tambahan                                     |

---

## 2. FLOW LENGKAP

### 2.1 Flow Antar Jemput - Tipe PER_KG

```
[CUSTOMER - APP]
1. Customer buka app -> pilih outlet
2. Customer tap "Antar Jemput" (bukan Drop and Go)
3. Customer CEK COVERAGE dulu:
   GET /customer/outlets/:id/coverage?lat=xxx&lng=xxx
   -> Jika dalam jangkauan: tampil ongkos_kirim
   -> Jika di luar jangkauan: tampil pesan error, tidak bisa lanjut
4. Customer isi form order:
   - Pilih jenis layanan (sama seperti drop and go)
   - Pilih durasi layanan (sama)
   - Pilih parfum (sama)
   - Special notes (sama)
   - Alamat pickup (wajib)
   - Lat/Lng pickup (dari GPS atau input manual)
   - Catatan alamat (opsional, contoh: rumah warna biru depan masjid)
   - Jadwal jemput (tanggal + jam)
   - Alamat antar balik (opsional, default sama dengan pickup)
5. Customer submit -> status: menunggu_konfirmasi
6. Customer TIDAK dapat QR Code (tidak relevan untuk antar jemput)

[OUTLET/KASIR - DASHBOARD]
7. Kasir lihat order baru di list dengan badge "Antar Jemput"
8. Kasir buka detail order -> lihat alamat, jadwal, nama customer
9. Kasir konfirmasi jadwal + assign diri sendiri atau kasir lain sebagai kurir
   PUT /outlet/orders/:id/pickup/konfirmasi
   -> Status order: dikonfirmasi
   -> Notif ke customer: "Penjemputan dikonfirmasi. Kurir datang [jadwal]."

[KASIR/KURIR - DI LAPANGAN]
10. Hari H, kasir/kurir berangkat menuju customer
    PUT /outlet/orders/:id/pickup/berangkat
    -> Status: kurir_menuju
    -> Notif ke customer: "Kurir sedang dalam perjalanan ke lokasi kamu!"

11. Kasir tiba di rumah customer -> ambil barang -> foto barang
    PUT /outlet/orders/:id/pickup/dijemput
    Body: { foto_barang_pickup: "url_cloudinary" }
    -> Status: barang_dijemput
    -> Notif ke customer: "Barang sudah dijemput. Tunggu notifikasi tagihan ya."

[DI OUTLET - PROSES TIMBANG]
12. Kasir timbang barang di outlet -> input berat + foto timbangan
    PUT /outlet/orders/:id/timbang  (ENDPOINT SAMA SEPERTI DROP AND GO)
    Body: { berat_aktual: 3.5, foto_timbangan: "url" }
    -> Sistem hitung: total = (berat x harga_per_kg) + parfum + ongkos_kirim
    -> Status: menunggu_pembayaran
    -> Notif tagihan ke customer

[CUSTOMER - BAYAR]
13. Customer terima notif tagihan
    GET /customer/orders/:id/tagihan
    -> Tampil: detail layanan, berat aktual, foto timbangan, ongkos kirim, total
14. Customer pilih metode pembayaran dan bayar
    POST /customer/orders/:id/payment
    -> Midtrans create transaction (SAMA SEPERTI DROP AND GO)
15. Webhook settlement diterima
    -> Status: sedang_diproses
    -> Notif: "Pembayaran berhasil! Laundry sedang diproses."

[KASIR - PROSES DAN ANTAR]
16. Laundry selesai diproses
    PUT /outlet/orders/:id/status
    Body: { status: "siap_diantar" }
    -> Notif ke customer: "Laundry selesai! Kurir sedang mengantar ke rumah kamu."

17. Kasir/kurir berangkat antar barang
    PUT /outlet/orders/:id/pickup/diantar
    -> Status: sedang_diantar
    -> Notif ke customer: "Kurir sedang dalam perjalanan ke lokasi kamu!"

18. Barang sampai ke customer
    PUT /outlet/orders/:id/pickup/selesai-antar
    -> Status: selesai
    -> Notif ke customer: "Laundry sudah diterima. Terima kasih!"
```

### 2.2 Flow Antar Jemput - Tipe PER_ITEM

Sama persis dengan PER_KG, kecuali:
- total_harga_final dihitung saat booking (bukan saat timbang)
- Step timbang di-skip, kasir langsung konfirmasi item diterima
- Setelah barang dijemput dan tiba di outlet, kasir langsung update status ke menunggu_pembayaran

### 2.3 Perbedaan Drop and Go vs Antar Jemput

```
ASPEK                  DROP AND GO              ANTAR JEMPUT
------------------     -------------------      ----------------------
Customer ke outlet     Ya, customer datang      Tidak
Kurir ke customer      Tidak                    Ya (kasir existing)
QR Code                Ya, untuk scan kasir     Tidak diperlukan
Alamat pickup          Tidak ada                Wajib diisi
Jadwal jemput          Tidak ada                Wajib diisi
Ongkos kirim           Tidak ada                Ada, dari outlet_coverage
Foto barang pickup     Tidak ada                Wajib saat jemput
Step konfirmasi outlet Tidak ada                Ada (assign kurir + konfirmasi jadwal)
Timbang berat          Di outlet oleh kasir     Di outlet setelah barang dijemput
Pembayaran             Setelah timbang          Setelah timbang (sama)
Status akhir           siap_diambil             siap_diantar -> sedang_diantar -> selesai
```

---

## 3. PERUBAHAN DATABASE

### 3.1 Update Enum di schema.prisma

Tambahkan enum baru:

```prisma
enum JenisOrder {
  drop_and_go
  antar_jemput
}

enum StatusPickup {
  menunggu_konfirmasi
  dikonfirmasi
  kurir_menuju
  barang_dijemput
  sedang_diantar
  selesai_antar
}
```

Update enum OrderStatus - tambahkan status baru:

```prisma
enum OrderStatus {
  // Existing (Drop and Go)
  menunggu_drop
  menunggu_pembayaran
  sedang_diproses
  siap_diambil
  selesai
  dibatalkan

  // Tambahan untuk Antar Jemput
  menunggu_konfirmasi
  dikonfirmasi
  kurir_menuju
  barang_dijemput
  siap_diantar
  sedang_diantar
}
```

### 3.2 Update Tabel orders

Tambahkan 1 field di model Order:

```prisma
model Order {
  // ... semua field existing tetap sama ...

  // TAMBAHAN
  jenis_order      JenisOrder @default(drop_and_go)

  // Tambahkan relasi
  order_pickup     OrderPickup?
}
```

### 3.3 Tabel Baru: order_pickup

```prisma
model OrderPickup {
  id                  String    @id @default(uuid())
  order_id            String    @unique
  alamat_pickup       String    @db.Text
  lat_pickup          Decimal   @db.Decimal(10, 8)
  lng_pickup          Decimal   @db.Decimal(11, 8)
  alamat_antar        String?   @db.Text
  lat_antar           Decimal?  @db.Decimal(10, 8)
  lng_antar           Decimal?  @db.Decimal(11, 8)
  jadwal_jemput       DateTime
  kurir_id            String?
  ongkos_kirim        Decimal   @db.Decimal(10, 2)
  foto_barang_pickup  String?   @db.Text
  catatan_alamat      String?   @db.Text
  created_at          DateTime  @default(now())
  updated_at          DateTime  @updatedAt

  order  Order  @relation(fields: [order_id], references: [id], onDelete: Cascade)
  kurir  User?  @relation("KurirPickup", fields: [kurir_id], references: [id])

  @@map("order_pickup")
}
```

Tambahkan relasi di model User:
```prisma
model User {
  // ... existing fields ...
  pickup_orders  OrderPickup[] @relation("KurirPickup")
}
```

### 3.4 Tabel Baru: outlet_coverage

```prisma
model OutletCoverage {
  id              String   @id @default(uuid())
  outlet_id       String
  nama_area       String   @db.VarChar(100)
  max_radius_km   Decimal  @db.Decimal(5, 2)
  ongkos_kirim    Decimal  @db.Decimal(10, 2)
  is_active       Boolean  @default(true)
  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt

  outlet  Outlet  @relation(fields: [outlet_id], references: [id], onDelete: Cascade)

  @@map("outlet_coverage")
}
```

Tambahkan relasi di model Outlet:
```prisma
model Outlet {
  // ... existing fields ...
  coverage  OutletCoverage[]
}
```

---

## 4. BUSINESS RULES TAMBAHAN

### 4.1 Validasi Coverage Sebelum Booking

[CRITICAL] Saat customer booking antar jemput, backend WAJIB validasi:
1. Ambil semua outlet_coverage yang aktif untuk outlet tersebut
2. Hitung jarak antara lat_pickup/lng_pickup customer dengan lat/lng outlet menggunakan Haversine
3. Cek apakah jarak <= max_radius_km salah satu coverage area
4. Jika tidak ada coverage yang mencakup: return 400 dengan pesan "Maaf, alamat kamu di luar jangkauan layanan antar jemput outlet ini."
5. Jika ada: ambil ongkos_kirim dari coverage area yang mencakup, simpan ke order_pickup.ongkos_kirim

Jika outlet punya lebih dari 1 coverage area yang mencakup koordinat customer, gunakan yang ongkos_kirim-nya paling murah.

### 4.2 Kalkulasi Harga Antar Jemput

Per KG:
  total_harga_final = (berat_aktual x durasi_layanan.harga) + parfum.harga + order_pickup.ongkos_kirim

Per Item:
  total_harga_final = SUM(item subtotal) + parfum.harga + order_pickup.ongkos_kirim

[CRITICAL] ongkos_kirim sudah disimpan di order_pickup saat booking, jangan ambil ulang dari outlet_coverage saat hitung harga (antisipasi jika ongkos berubah setelah booking).

### 4.3 Status Flow Antar Jemput

[CRITICAL] Status flow antar jemput BERBEDA dari drop and go:

DROP AND GO:
  menunggu_drop -> menunggu_pembayaran -> sedang_diproses -> siap_diambil -> selesai

ANTAR JEMPUT:
  menunggu_konfirmasi -> dikonfirmasi -> kurir_menuju -> barang_dijemput
  -> menunggu_pembayaran -> sedang_diproses -> siap_diantar -> sedang_diantar -> selesai

[CRITICAL] Status tidak boleh loncat. Setiap update status dicatat di order_status_log.

### 4.4 Assign Kurir

- Kasir yang assign kurir adalah admin_outlet atau kasir dari outlet yang sama
- kurir_id diisi dengan user.id kasir yang diassign
- Kasir yang diassign sebagai kurir WAJIB memiliki role kasir atau admin_outlet dan terdaftar di outlet_kasir untuk outlet tersebut
- [CRITICAL] Validasi: kurir_id harus ada di tabel outlet_kasir dengan outlet_id yang sama dan is_active = true

### 4.5 Foto Barang Pickup

- Kasir wajib upload foto barang saat konfirmasi dijemput
- [CRITICAL] PUT /outlet/orders/:id/pickup/dijemput harus reject jika foto_barang_pickup tidak disertakan
- Foto disimpan ke Cloudinary folder: laundry/pickup

### 4.6 Pembayaran Tidak Akan Diproses Sampai Bayar

- [CRITICAL] Kasir TIDAK BOLEH update status ke siap_diantar jika orders.status masih bukan sedang_diproses
- Barang tidak akan diantar sebelum payment settlement dikonfirmasi oleh Midtrans
- Jika customer belum bayar setelah X jam (konfigurasi outlet), kasir bisa cancel order secara manual

### 4.7 Jadwal Jemput

- jadwal_jemput harus minimal 2 jam dari waktu booking (beri waktu outlet konfirmasi)
- jadwal_jemput tidak bisa di masa lalu
- Format: ISO 8601 datetime string

### 4.8 Alamat Antar

- Jika customer tidak isi alamat_antar, default sama dengan alamat_pickup
- Jika lat_antar/lng_antar tidak diisi, default sama dengan lat_pickup/lng_pickup

---

## 5. API ENDPOINTS TAMBAHAN

### 5.1 Customer Endpoints Tambahan

GET /customer/outlets/:id/coverage
  Deskripsi : Cek apakah koordinat customer dalam jangkauan antar jemput outlet
  Auth      : customer
  Query     : lat (required), lng (required)
  Response sukses:
  {
    "success": true,
    "data": {
      "dalam_jangkauan": true,
      "ongkos_kirim": 10000,
      "nama_area": "Baleendah",
      "jarak_km": 3.2
    }
  }
  Response di luar jangkauan:
  {
    "success": true,
    "data": {
      "dalam_jangkauan": false,
      "pesan": "Alamat kamu di luar jangkauan layanan antar jemput outlet ini."
    }
  }

POST /customer/orders (UPDATE - tambah field untuk antar jemput)
  Field tambahan jika jenis_order = antar_jemput:
  {
    "jenis_order": "antar_jemput",
    "alamat_pickup": "Jl. Mawar No. 5, Baleendah",
    "lat_pickup": -6.9824,
    "lng_pickup": 107.6301,
    "alamat_antar": "Jl. Melati No. 3 (opsional)",
    "lat_antar": -6.9830,
    "lng_antar": 107.6310,
    "jadwal_jemput": "2025-06-01T10:00:00+07:00",
    "catatan_alamat": "Rumah warna biru, depan masjid Al-Ikhlas"
  }
  Validasi tambahan:
  - Jika jenis_order = antar_jemput: alamat_pickup, lat_pickup, lng_pickup, jadwal_jemput WAJIB diisi
  - Jika jenis_order = drop_and_go: field pickup diabaikan

### 5.2 Outlet/Kasir Endpoints Tambahan

GET /outlet/orders/pickup
  Deskripsi : List order antar jemput dengan filter status
  Auth      : admin_outlet, kasir
  Query     : status (opsional), page, limit
  Response  : list order dengan data pickup (jadwal, alamat, kurir assigned)

PUT /outlet/orders/:id/pickup/konfirmasi
  Deskripsi : Konfirmasi jadwal penjemputan + assign kasir sebagai kurir
  Auth      : admin_outlet, kasir
  Body      :
  {
    "kurir_id": "uuid-user-kasir"
  }
  Logic     :
  - Validasi kurir_id terdaftar di outlet_kasir outlet ini dan is_active = true
  - Update order_pickup.kurir_id
  - Update orders.status = dikonfirmasi
  - Catat order_status_log
  - Push notif ke customer

PUT /outlet/orders/:id/pickup/berangkat
  Deskripsi : Kasir/kurir konfirmasi sedang menuju lokasi customer
  Auth      : admin_outlet, kasir
  Body      : {} (tidak perlu body)
  Logic     :
  - Validasi: req.user.userId harus sama dengan order_pickup.kurir_id
  - Update orders.status = kurir_menuju
  - Catat order_status_log
  - Push notif ke customer

PUT /outlet/orders/:id/pickup/dijemput
  Deskripsi : Konfirmasi barang sudah diambil dari customer + upload foto
  Auth      : admin_outlet, kasir
  Body      : form-data dengan field foto_barang_pickup (file gambar, WAJIB)
  Logic     :
  - Validasi: req.user.userId harus sama dengan order_pickup.kurir_id
  - Upload foto ke Cloudinary folder laundry/pickup
  - Update order_pickup.foto_barang_pickup = cloudinary_url
  - Update orders.status = barang_dijemput
  - Catat order_status_log
  - Push notif ke customer

PUT /outlet/orders/:id/timbang
  Deskripsi : ENDPOINT SAMA SEPERTI DROP AND GO - tidak berubah
  Logic tambahan: hitung total_harga_final += order_pickup.ongkos_kirim jika jenis_order = antar_jemput

PUT /outlet/orders/:id/pickup/diantar
  Deskripsi : Kasir/kurir konfirmasi sedang mengantar barang ke customer
  Auth      : admin_outlet, kasir
  Validasi  : orders.status HARUS = siap_diantar (sudah bayar dan laundry selesai)
  Body      : {} (tidak perlu body)
  Logic     :
  - Update orders.status = sedang_diantar
  - Catat order_status_log
  - Push notif ke customer

PUT /outlet/orders/:id/pickup/selesai-antar
  Deskripsi : Konfirmasi barang sudah diterima customer
  Auth      : admin_outlet, kasir
  Body      : {} (tidak perlu body)
  Logic     :
  - Update orders.status = selesai
  - Catat order_status_log
  - Push notif ke customer

GET /outlet/coverage
  Deskripsi : List area coverage outlet
  Auth      : admin_outlet
  Response  : list coverage area dengan ongkos_kirim

POST /outlet/coverage
  Deskripsi : Tambah area coverage baru
  Auth      : admin_outlet
  Body      :
  {
    "nama_area": "Baleendah",
    "max_radius_km": 5.0,
    "ongkos_kirim": 10000
  }

PUT /outlet/coverage/:id
  Deskripsi : Edit area coverage
  Auth      : admin_outlet
  Body      : sama dengan POST (semua field opsional)

DELETE /outlet/coverage/:id
  Deskripsi : Nonaktifkan area coverage (soft delete: is_active = false)
  Auth      : admin_outlet

---

## 6. NOTIFIKASI TAMBAHAN

Event                     | Penerima  | Judul                        | Pesan
--------------------------|-----------|------------------------------|----------------------------------------------
Outlet konfirmasi jadwal  | Customer  | Penjemputan Dikonfirmasi     | Kurir akan menjemput laundry kamu pada [jadwal].
Kurir berangkat jemput    | Customer  | Kurir Sedang Menuju          | Kurir sedang dalam perjalanan ke lokasi kamu!
Barang sudah dijemput     | Customer  | Barang Sudah Dijemput        | Barang sudah dijemput. Tunggu notifikasi tagihan ya.
Siap diantar              | Customer  | Laundry Siap Diantar         | Laundry selesai! Kurir sedang mengantar ke rumah kamu.
Sedang diantar            | Customer  | Kurir Sedang Mengantar       | Kurir sedang dalam perjalanan ke lokasi kamu!
Selesai diantar           | Customer  | Laundry Selesai Diterima     | Laundry sudah diterima. Terima kasih telah menggunakan layanan kami!

Catatan:
- Notifikasi "Tagihan" dan "Pembayaran Berhasil" SAMA PERSIS dengan Drop and Go, tidak berubah
- Semua notifikasi WAJIB disimpan ke tabel notifications
- Jika FCM gagal: log error, jangan gagalkan main process

---

## 7. VALIDASI TAMBAHAN (ZOD SCHEMA)

Tambahan di order schema untuk antar jemput:

const antarJemputFields = z.object({
  alamat_pickup  : z.string().min(10).max(500),
  lat_pickup     : z.number().min(-90).max(90),
  lng_pickup     : z.number().min(-180).max(180),
  alamat_antar   : z.string().min(10).max(500).optional(),
  lat_antar      : z.number().min(-90).max(90).optional(),
  lng_antar      : z.number().min(-180).max(180).optional(),
  jadwal_jemput  : z.string().datetime({ offset: true })
                    .refine(val => new Date(val) > new Date(Date.now() + 2*60*60*1000),
                      { message: "Jadwal jemput minimal 2 jam dari sekarang" }),
  catatan_alamat : z.string().max(500).optional()
})

const createOrderSchema = z.discriminatedUnion("jenis_order", [
  z.object({ jenis_order: z.literal("drop_and_go"), ...dropAndGoFields }),
  z.object({ jenis_order: z.literal("antar_jemput"), ...dropAndGoFields, ...antarJemputFields })
])

---

## 8. RINGKASAN YANG TIDAK BERUBAH

Fitur-fitur berikut TIDAK PERLU DIMODIFIKASI:

- Auth module (login, register, JWT) -> tidak berubah
- Setup layanan (jenis, durasi, item, parfum) -> tidak berubah
- Payment flow (create payment, webhook, check status) -> tidak berubah
- Kalkulasi harga dasar -> tidak berubah, hanya ditambah ongkos_kirim
- Saldo dan pencairan -> tidak berubah
- Superadmin module -> tidak berubah
- Notifikasi tagihan dan pembayaran -> tidak berubah
- Struktur folder project -> tidak berubah
- Response format dan error handling -> tidak berubah
