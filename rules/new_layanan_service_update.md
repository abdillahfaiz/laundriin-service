**DOKUMENTASI PERUBAHAN** 

**Perubahan Domain Layanan Per Item** 

**Pemisahan JenisPerItem + DurasiPerItem & Penambahan Fitur Antar Jemput** 

Laundriin Service • 2025 

---

1. Ringkasan Eksekutif 

Dokumen ini menjelaskan perubahan schema database dan API endpoint pada Laundriin Service dari versi 2 ke versi 3. Perubahan utama berfokus pada:

* Pemisahan domain layanan Per Item — Jenis layanan dan durasi per item kini memiliki tabel tersendiri, terpisah sepenuhnya dari domain Per KG.


* Penghapusan tabel ambigu — Tabel ItemJenisLayanan dan ItemHarga dihapus dan digantikan struktur yang lebih eksplisit.


* Penambahan fitur Antar Jemput — Tabel OrderPickup dan OutletCoverage ditambahkan beserta 11 endpoint baru.


* Pembaruan total endpoint layanan — Dari 4 endpoint layanan menjadi 20+ endpoint yang terbagi per domain.



> ❌ **PENTING:** Semua perubahan bersifat BREAKING CHANGE. Aplikasi Android dan Dashboard harus diupdate menyesuaikan endpoint dan body request yang baru.
> 
> 

---

2. Latar Belakang Masalah 

2.1 Masalah pada Schema v2 

Schema v2 menggunakan tabel JenisLayanan dan DurasiLayanan secara bersama-sama untuk kedua tipe layanan (Per KG dan Per Item). Hal ini menyebabkan sejumlah masalah:

* 
**Ambiguitas tipe:** Field tipe (per_kg | per_item) di JenisLayanan membuat tabel ini merangkap dua peran yang berbeda secara fundamental.


* 
**Relasi tidak natural:** Item memiliki Jenis Layanan via tabel junction ItemJenisLayanan — ini berarti satu record JenisLayanan bisa 'dimiliki' oleh banyak item sekaligus, padahal seharusnya setiap item punya jenis layanannya sendiri.


* 
**Harga per item tidak jelas:** ItemHarga link ke durasi_layanan_id dari tabel DurasiLayanan yang sama dengan Per KG, sehingga tidak ada pemisahan yang jelas antara durasi Per KG dan durasi Per Item.


* 
**Flow customer membingungkan:** Saat customer memilih item, mereka harus GET jenis layanan yang difilter per item — bukan mengambil jenis layanan milik item tersebut secara langsung.



2.2 Ilustrasi Masalah 

> ❌ **Schema v2 — Struktur Bermasalah** SCHEMA LAMA (v2) — Bermasalah:
> 
> 
> ItemLayanan: 'Sepatu Biasa' └── ItemJenisLayanan (junction) ──→ JenisLayanan: 'Cuci Biasa' ← SHARED! └──→ DurasiLayanan: 'Express' ← SHARED dengan Per KG! └── ItemHarga: Rp 25.000 
> 
> 
> Masalah: JenisLayanan 'Cuci Biasa' adalah record yang sama "yang bisa juga dipakai oleh item lain (Selimut, Bantal, dll)" padahal seharusnya setiap item punya 'Cuci Biasa'-nya sendiri dengan harga yang berbeda.
> 
> 

---

3. Perubahan Schema Database 

3.1 Tabel yang Dihapus 

Dua tabel berikut dihapus sepenuhnya dari schema:

| Tabel | Alasan Dihapus | Digantikan Oleh |
| --- | --- | --- |
| ItemJenisLayanan | Junction table yang menjadi sumber ambiguitas. Memungkinkan satu JenisLayanan dimiliki banyak item sekaligus — bertentangan dengan kebutuhan bisnis.

 | JenisPerItem 

 |
| ItemHarga | Tabel harga yang linknya ke DurasiLayanan (domain Per KG) membuat relasi domain Per Item bergantung pada tabel domain lain.

 | DurasiPerItem 

 |

3.2 Tabel yang Dimodifikasi 

Tabel JenisLayanan dan DurasiLayanan tetap ada namun dengan satu perubahan penting:

| Tabel | Perubahan | Keterangan |
| --- | --- | --- |
| JenisLayanan | Hapus field tipe (per_kg

 | per_item).

 |
| DurasiLayanan | Tidak ada perubahan field.

 | Tetap sebagai variasi durasi + harga untuk JenisLayanan Per KG.

 |
| Order | Hapus field tipe_layanan, tambah relasi ke JenisPerItem/DurasiPerItem. 

 | tipe_layanan masih ada tapi derivasi dari jenis_layanan_id vs order_items.

 |
| OrderItem | Ganti item_harga_id → jenis_per_item_id + durasi_per_item_id + harga_satuan + subtotal.

 | Setiap item order menyimpan snapshot harga saat order dibuat.

 |

3.3 Tabel Baru 

3.3.1 JenisPerItem 

Jenis layanan yang dimiliki langsung oleh sebuah item. Contoh: Item 'Sepatu Biasa' memiliki jenis 'Cuci Biasa' dan 'Cuci Premium'.

```prisma
[cite_start]// model JenisPerItem — Prisma Schema [cite: 34]
model JenisPerItem {
  id              String   @id @default(uuid())
  item_layanan_id String
  nama            String   @db.VarChar(100)   // 'Cuci Biasa', 'Cuci Premium'
  deskripsi       String?  @db.Text
  is_active       Boolean  @default(true)
  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt
 
  item_layanan    ItemLayanan     @relation(fields: [item_layanan_id], references: [id], onDelete: Cascade)
  durasi_per_item DurasiPerItem[]
  order_items     OrderItem[]
 
  @@map("jenis_per_item")
}

```

3.3.2 DurasiPerItem 

Variasi durasi dan harga yang dimiliki oleh sebuah JenisPerItem. Contoh: 'Cuci Biasa' Sepatu Biasa → Express Rp 25.000, Reguler Rp 18.000.

```prisma
[cite_start]// model DurasiPerItem — Prisma Schema [cite: 37]
model DurasiPerItem {
  id                String   @id @default(uuid())
  jenis_per_item_id String
  nama              String   @db.VarChar(100)   // 'Express', 'Reguler'
  estimasi_jam      Int
  harga             Decimal  @db.Decimal(12, 2)
  is_active         Boolean  @default(true)
  created_at        DateTime @default(now())
  updated_at        DateTime @updatedAt
 
  jenis_per_item  JenisPerItem @relation(fields: [jenis_per_item_id], references: [id], onDelete: Cascade)
  order_items     OrderItem[]
 
  @@map("durasi_per_item")
}

```

3.3.3 OrderPickup (Antar Jemput) 

```prisma
[cite_start]// model OrderPickup — Prisma Schema [cite: 39]
model OrderPickup {
  id               String    @id @default(uuid())
  order_id         String    @unique
  alamat_pickup    String    @db.Text
  lat_pickup       Float
  lng_pickup       Float
  alamat_antar     String?   @db.Text     // default = alamat_pickup
  lat_antar        Float?
  lng_antar        Float?
  jadwal_jemput    DateTime              // min 2 jam dari waktu booking
  kurir_id         String?               // kasir yang ditugaskan
  ongkos_kirim     Decimal  @db.Decimal(12, 2)  // di-lock saat booking
  foto_barang_pickup String? @db.Text    // WAJIB saat status dijemput
  catatan_alamat   String?  @db.Text
  created_at       DateTime @default(now())
  updated_at       DateTime @updatedAt
 
  order  Order @relation(fields: [order_id], references: [id], onDelete: Cascade)
  kurir  User? @relation('KurirPickup', fields: [kurir_id], references: [id])
 
  @@map("order_pickup")
}

```

3.3.4 OutletCoverage (Antar Jemput) 

```prisma
[cite_start]// model OutletCoverage — Prisma Schema [cite: 41]
model OutletCoverage {
  id             String   @id @default(uuid())
  outlet_id      String
  nama_area      String   @db.VarChar(150)
  max_radius_km  Float
  ongkos_kirim   Decimal  @db.Decimal(12, 2)
  is_active      Boolean  @default(true)
  created_at     DateTime @default(now())
  updated_at     DateTime @updatedAt
 
  outlet  Outlet @relation(fields: [outlet_id], references: [id], onDelete: Cascade)
 
  @@map("outlet_coverage")
}

```

---

4. Perubahan Model OrderItem 

4.1 Perbandingan v2 vs v3 

| Field | v2 (Lama) | v3 (Baru) | Keterangan |
| --- | --- | --- | --- |
| item_layanan_id | ✅ Ada 

 | ✅ Ada 

 | Tidak berubah 

 |
| item_harga_id | ✅ Ada 

 | ❌ Dihapus 

 | Digantikan oleh 2 field baru di bawah 

 |
| jenis_per_item_id | ❌ Tidak ada 

 | ✅ BARU 

 | ID jenis layanan yang dipilih untuk item ini 

 |
| durasi_per_item_id | ❌ Tidak ada 

 | ✅ BARU 

 | ID durasi yang dipilih, menentukan harga 

 |
| qty | ✅ Ada 

 | ✅ Ada 

 | Tidak berubah 

 |
| harga_satuan | ❌ Tidak ada 

 | ✅ BARU 

 | Snapshot harga saat order dibuat (tidak berubah walaupun admin edit harga) 

 |
| subtotal | ❌ Tidak ada 

 | ✅ BARU 

 | qty × harga_satuan, dihitung saat order dibuat 

 |

```prisma
[cite_start]// model OrderItem v3 — Prisma Schema [cite: 45]
model OrderItem {
  id                 String  @id @default(uuid())
  order_id           String
  item_layanan_id    String
  jenis_per_item_id  String   // NEW: jenis layanan yang dipilih customer
  durasi_per_item_id String   // NEW: durasi yang dipilih customer
  qty                Int
  harga_satuan       Decimal  @db.Decimal(12, 2)  // NEW: price snapshot
  subtotal           Decimal  @db.Decimal(12, 2)  // NEW: qty * harga_satuan
 
  order           Order         @relation(fields: [order_id], references: [id], onDelete: Cascade)
  item_layanan    ItemLayanan   @relation(fields: [item_layanan_id], references: [id])
  jenis_per_item  JenisPerItem  @relation(fields: [jenis_per_item_id], references: [id])
  durasi_per_item DurasiPerItem @relation(fields: [durasi_per_item_id], references: [id])
 
  @@map("order_items")
}

```

---

5. Ilustrasi Struktur Data 

5.1 Domain Per KG (Tidak Berubah) 

> ✅ **Per KG — Struktur Data** JenisLayanan: 'Cuci + Setrika' (outlet A) ├── DurasiLayanan: 'Super Express' 4 jam Rp 18.000/kg ├── DurasiLayanan: 'Express' 8 jam Rp 12.000/kg └── DurasiLayanan: 'Reguler' 24 jam Rp 8.000/kg 
> 
> 
> JenisLayanan: 'Cuci Saja' (outlet A) ├── DurasiLayanan: 'Express' 8 jam Rp 8.000/kg └── DurasiLayanan: 'Reguler' 24 jam Rp 5.000/kg 
> 
> 

5.2 Domain Per Item (Baru) 

> ✅ **Per Item — Struktur Data Baru** ItemLayanan: 'Sepatu Biasa' (outlet A) ├── JenisPerItem: 'Cuci Biasa' ← MILIK item ini, bukan shared │ ├── DurasiPerItem: 'Express' 8 jam Rp 25.000 │ └── DurasiPerItem: 'Reguler' 24 jam Rp 18.000 └── JenisPerItem: 'Cuci Premium' ├── DurasiPerItem: 'Express' 8 jam Rp 40.000 └── DurasiPerItem: 'Reguler' 24 jam Rp 30.000 
> 
> 
> ItemLayanan: 'Selimut' (outlet A) └── JenisPerItem: 'Cuci Biasa' ← nama sama tapi RECORD BERBEDA ├── DurasiPerItem: 'Express' 8 jam Rp 35.000 └── DurasiPerItem: 'Reguler' 24 jam Rp 25.000 
> 
> 
> ItemLayanan: 'Bantal' (outlet A) └── JenisPerItem: 'Cuci Biasa' ├── DurasiPerItem: 'Express' 8 jam Rp 20.000 └── DurasiPerItem: 'Reguler' 24 jam Rp 15.000 
> 
> 

> ✅ **CATATAN:** Poin kunci: 'Cuci Biasa' di Sepatu Biasa dan 'Cuci Biasa' di Selimut adalah dua record JenisPerItem yang BERBEDA dengan harga yang berbeda pula. Keduanya tidak saling berbagi data.
> 
> 

---

6. Perubahan API Endpoint 

6.1 Endpoint yang Dihapus / Diubah URL 

| Endpoint Lama (v2) | Status | Endpoint Baru (v3) |
| --- | --- | --- |
| GET /customer/outlets/:id/layanan | 🔀 Dipisah | GET /customer/outlets/:id/layanan/per-kg 

 |
| GET /customer/outlets/:id/durasi/:jenisId | 🔀 Diubah | GET /customer/outlets/:id/layanan/per-kg/:jenisId/durasi 

 |
| GET /customer/outlets/:id/items | 🔀 Diubah | GET /customer/outlets/:id/layanan/per-item/items 

 |
| GET /customer/outlets/:id/items/:jenisId | ❌ Dihapus | (tidak relevan dengan flow baru) 

 |
| GET /customer/outlets/:id/jenis-layanan-by-item/:itemId | 🔀 Diubah | GET /customer/outlets/:id/layanan/per-item/items/:itemId/jenis 

 |
| GET /outlet/layanan/jenis | 🔀 Diubah | GET /outlet/layanan/per-kg/jenis 

 |
| POST /outlet/layanan/jenis | 🔀 Diubah + body berubah | POST /outlet/layanan/per-kg/jenis (hapus field tipe) 

 |
| GET /outlet/layanan/durasi | 🔀 Diubah | GET /outlet/layanan/per-kg/jenis/:id/durasi 

 |
| POST /outlet/layanan/durasi | 🔀 Diubah URL | POST /outlet/layanan/per-kg/jenis/:id/durasi 

 |
| GET /outlet/layanan/items | 🔀 Diubah | GET /outlet/layanan/per-item/items 

 |
| POST /outlet/layanan/items (body lama) | 🔀 Body berubah total | POST /outlet/layanan/per-item/items (body sederhana) 

 |
| PUT /outlet/layanan/items/:id (body lama) | 🔀 Body berubah | PUT /outlet/layanan/per-item/items/:id 

 |

6.2 Endpoint Baru — Per Item 

| Method | Endpoint | Keterangan |
| --- | --- | --- |
| GET | /outlet/layanan/per-item/items/:id/jenis | Daftar jenis layanan milik item 

 |
| POST | /outlet/layanan/per-item/items/:id/jenis | Tambah jenis layanan ke item 

 |
| PUT | /outlet/layanan/per-item/jenis/:id | Update jenis per item 

 |
| PUT | /outlet/layanan/per-item/jenis/:id/toggle | Toggle aktif/nonaktif 

 |
| DELETE | /outlet/layanan/per-item/jenis/:id | Hapus jenis per item 

 |
| GET | /outlet/layanan/per-item/jenis/:id/durasi | Daftar durasi+harga milik jenis 

 |
| POST | /outlet/layanan/per-item/jenis/:id/durasi | Tambah durasi ke jenis per item 

 |
| PUT | /outlet/layanan/per-item/durasi/:id | Update durasi per item 

 |
| PUT | /outlet/layanan/per-item/durasi/:id/toggle | Toggle aktif/nonaktif 

 |
| DELETE | /outlet/layanan/per-item/durasi/:id | Hapus durasi per item 

 |

6.3 Endpoint Baru — Antar Jemput 

| Method | Endpoint | Keterangan |
| --- | --- | --- |
| GET | /customer/outlets/:id/coverage?lat=&lng= | Cek coverage + ongkos kirim 

 |
| GET | /outlet/orders/pickup | Daftar order antar jemput 

 |
| PUT | /outlet/orders/:id/pickup/konfirmasi | Assign kurir → status dikonfirmasi 

 |
| PUT | /outlet/orders/:id/pickup/berangkat | Kurir berangkat → kurir_menuju 

 |
| PUT | /outlet/orders/:id/pickup/dijemput | Upload foto barang → barang_dijemput 

 |
| PUT | /outlet/orders/:id/pickup/diantar | Mulai antar → sedang_diantar 

 |
| PUT | /outlet/orders/:id/pickup/selesai-antar | Selesai antar → selesai 

 |
| GET | /outlet/coverage | Daftar area coverage 

 |
| POST | /outlet/coverage | Tambah area coverage 

 |
| PUT | /outlet/coverage/:id | Update area coverage 

 |
| DELETE | /outlet/coverage/:id | Hapus area coverage 

 |

---

7. Perubahan Body Request 

7.1 Create Order Per Item 

Field items di Create Order sekarang wajib menyertakan `jenis_per_item_id` dan `durasi_per_item_id`:

```json
[cite_start]// ❌ v2 — Body Create Order Per Item (Lama) [cite: 62]
// LAMA (tidak lagi valid)
{
  "outlet_id": "...",
  "tipe_layanan": "per_item",
  "items": [
    {
      "item_layanan_id": "...",
      "qty": 2
      // MASALAH: tidak ada info jenis dan durasi apa yang dipilih
    }
  ]
}

```

```json
[cite_start]// ✅ v3 — Body Create Order Per Item (Baru) [cite: 63]
// BARU
{
  "outlet_id": "...",
  "jenis_order": "drop_and_go",
  "tipe_layanan": "per_item",
  "parfum_id": "...",
  "special_notes": "...",
  "items": [
    {
      "item_layanan_id": "...",       // item yang dipilih
      "jenis_per_item_id": "...",     // NEW: jenis layanan item
      "durasi_per_item_id": "...",    // NEW: durasi yang dipilih
      "qty": 2
    }
  ]
}

```

7.2 Create Jenis Layanan (Per KG) 

Field tipe dihapus dari body request karena tabel JenisLayanan sekarang hanya untuk Per KG:

```json
[cite_start]// Perubahan Body Create Jenis Layanan [cite: 66]
// ❌ v2 — LAMA
{ "nama": "Cuci Premium", "deskripsi": "...", "tipe": "per_kg" }
 
// ✅ v3 — BARU
{ "nama": "Cuci Premium", "deskripsi": "..." }
// Field 'tipe' tidak ada lagi — selalu per_kg implisit

```

7.3 Create Item Layanan 

Struktur body Create Item menjadi jauh lebih sederhana. Jenis layanan dan durasi ditambahkan lewat endpoint terpisah:

```json
[cite_start]// Perubahan Body Create Item Layanan [cite: 69]
// ❌ v2 — LAMA (kompleks, membingungkan)
{
  "nama_item": "Karpet",
  "jenis_layanan_ids": ["jenisId1"],      // ID dari JenisLayanan Per KG?
  "harga_configs": [                        // tidak jelas konteksnya
    { "durasi_layanan_id": "...", "harga": 50000 }
  ]
}
 
// ✅ v3 — BARU (sederhana)
{
  "nama_item": "Karpet",
  "foto_item": null
}
// Jenis layanan ditambahkan via: POST /outlet/layanan/per-item/items/:id/jenis
// Durasi ditambahkan via: POST /outlet/layanan/per-item/jenis/:id/durasi

```

---

8. Flow Lengkap Customer — Booking Per Item 

8.1 Flow Pemilihan Layanan 

Urutan API call yang dilakukan aplikasi Android saat customer melakukan booking per item:

* 
**Step 1 — Tampilkan daftar item:** GET `/customer/outlets/:id/layanan/per-item/items` → dapat list ItemLayanan.


* 
**Step 2 — Customer pilih item (misal: Sepatu Biasa):**. Ambil jenis layanannya: GET `.../items/:itemId/jenis` → dapat list JenisPerItem.


* 
**Step 3 — Customer pilih jenis (misal: Cuci Biasa):**. Ambil durasi: GET `.../jenis/:jenisId/durasi` → dapat list DurasiPerItem + harga.


* 
**Step 4 — Customer pilih durasi:** (Express Rp 25.000). Tampilkan ringkasan order.


* 
**Step 5 — Customer konfirmasi:**. Kirim: POST `/customer/orders` dengan item_layanan_id, jenis_per_item_id, durasi_per_item_id, qty.



8.2 Contoh Response GET Items 

```json
[cite_start]// Response GET Items [cite: 81]
GET /customer/outlets/:id/layanan/per-item/items
 
Response:
{
  "success": true,
  "data": [
    {
      "id": "item-uuid-1",
      "nama_item": "Sepatu Biasa",
      "foto_item": "https://cloudinary.com/sepatu.jpg",
      "is_active": true
    },
    {
      "id": "item-uuid-2",
      "nama_item": "Selimut",
      "foto_item": null,
      "is_active": true
    }
  ]
}

```

8.3 Contoh Response GET Jenis by Item 

```json
[cite_start]// Response GET Jenis by Item [cite: 83]
GET /customer/outlets/:id/layanan/per-item/items/item-uuid-1/jenis
 
Response: (jenis layanan MILIK Sepatu Biasa)
{
  "success": true,
  "data": [
    { "id": "jenis-uuid-1", "nama": "Cuci Biasa", "deskripsi": "..." },
    { "id": "jenis-uuid-2", "nama": "Cuci Premium", "deskripsi": "..." }
  ]
}

```

8.4 Contoh Response GET Durasi by Jenis 

```json
[cite_start]// Response GET Durasi by Jenis [cite: 85]
GET /customer/outlets/:id/layanan/per-item/jenis/jenis-uuid-1/durasi
 
Response: (durasi + harga untuk Cuci Biasa Sepatu Biasa)
{
  "success": true,
  "data": [
    { "id": "durasi-uuid-1", "nama": "Express", "estimasi_jam": 8, "harga": 25000 },
    { "id": "durasi-uuid-2", "nama": "Reguler", "estimasi_jam": 24, "harga": 18000 }
  ]
}

```

---

9. Flow Admin Outlet — Setup Per Item 

9.1 Urutan Setup 

Admin outlet membuat konfigurasi layanan per item dalam 3 tahap:

* 
**Buat Item:** POST `/outlet/layanan/per-item/items` Body: `{ nama_item, foto_item }`.


* 
**Tambah Jenis ke Item:** POST `/outlet/layanan/per-item/items/:id/jenis` Body: `{ nama, deskripsi }`.


* 
**Tambah Durasi ke Jenis:** POST `/outlet/layanan/per-item/jenis/:id/durasi` Body: `{ nama, estimasi_jam, harga }`.


* Ulangi step 2 dan 3 untuk setiap kombinasi jenis dan durasi yang diinginkan.



9.2 Contoh Setup Lengkap 

```javascript
[cite_start]// Contoh Alur Setup Per Item [cite: 94]
// 1. Buat item
POST /outlet/layanan/per-item/items
{ "nama_item": "Sepatu Biasa" }
// → dapat id: 'item-abc'
 
// 2a. Tambah jenis pertama ke item
POST /outlet/layanan/per-item/items/item-abc/jenis
{ "nama": "Cuci Biasa" }
// → dapat id: 'jenis-x1'
 
// 2b. Tambah jenis kedua ke item
POST /outlet/layanan/per-item/items/item-abc/jenis
{ "nama": "Cuci Premium" }
// → dapat id: 'jenis-x2'
 
// 3a. Tambah durasi ke Cuci Biasa
POST /outlet/layanan/per-item/jenis/jenis-x1/durasi
{ "nama": "Express", "estimasi_jam": 8, "harga": 25000 }
 
POST /outlet/layanan/per-item/jenis/jenis-x1/durasi
{ "nama": "Reguler", "estimasi_jam": 24, "harga": 18000 }
 
// 3b. Tambah durasi ke Cuci Premium
POST /outlet/layanan/per-item/jenis/jenis-x2/durasi
{ "nama": "Express", "estimasi_jam": 8, "harga": 40000 }

```

---

10. Variabel Baru di Postman Collection 

Collection v3 menambahkan 3 variabel baru yang perlu di-set saat testing:

| Variabel | Tipe | Keterangan |
| --- | --- | --- |
| jenisPerItemId | UUID | ID dari record JenisPerItem. Didapat dari response POST /outlet/layanan/per-item/items/:id/jenis 

 |
| durasiPerItemId | UUID | ID dari record DurasiPerItem. Didapat dari response POST /outlet/layanan/per-item/jenis/:id/durasi 

 |
| coverageId | UUID | ID dari record OutletCoverage. Didapat dari response POST /outlet/coverage 

 |

> ⚠️ **PERHATIAN:** jenisLayananId dan durasiLayananId tetap ada tapi sekarang khusus untuk domain Per KG. Jangan campur dengan jenisPerItemId dan durasiPerItemId.
> 
> 

---

11. Status Order — Antar Jemput 

11.1 Flow Status Lengkap 

| Status | Trigger | Actor | Keterangan |
| --- | --- | --- | --- |
| menunggu_konfirmasi | Order dibuat dengan jenis_order: antar_jemput | Customer | Order masuk, menunggu outlet assign kurir 

 |
| dikonfirmasi | PUT /pickup/konfirmasi | Admin Outlet | Kurir di-assign, customer dapat notifikasi 

 |
| kurir_menuju | PUT /pickup/berangkat | Kasir/Kurir | Kurir mulai berangkat ke alamat customer 

 |
| barang_dijemput | PUT /pickup/dijemput + foto | Kasir/Kurir | WAJIB upload foto barang. Barang sudah di tangan kurir 

 |
| menunggu_pembayaran | Outlet input berat (per_kg) atau otomatis (per_item) | Sistem | Tagihan dikirim ke customer 

 |
| sedang_diproses | Payment settlement webhook | Sistem (Midtrans) | Pembayaran confirmed, laundry mulai diproses 

 |
| siap_diantar | PUT /status { status: siap_diantar } | Kasir | Laundry selesai, siap diantar 

 |
| sedang_diantar | PUT /pickup/diantar | Kasir/Kurir | Kurir berangkat mengantar 

 |
| selesai | PUT /pickup/selesai-antar | Kasir/Kurir | Barang sudah diterima customer 

 |

11.2 Business Rules Antar Jemput 

* 
**Validasi coverage:** Sistem cek koordinat customer vs outlet menggunakan Haversine sebelum order dibuat. Jika tidak dalam coverage area, order ditolak.


* 
**Ongkos kirim di-lock:** ongkos_kirim disimpan di tabel order_pickup saat order dibuat, tidak berubah walaupun admin edit harga coverage kemudian.


* 
**Jadwal minimum:** Jadwal jemput minimal 2 jam dari waktu booking. Tidak bisa di masa lampau.


* 
**Foto wajib:** foto_barang_pickup wajib diupload saat update status ke barang_dijemput.


* 
**Kurir harus dari outlet:** kurir_id yang di-assign harus terdaftar di outlet_kasir dengan outlet yang sama dan is_active = true.


* 
**Urutan status ketat:** Tidak bisa loncat status . siap_diantar hanya bisa dicapai setelah sedang_diproses (artinya sudah bayar).


* 
**Coverage overlap:** Jika customer masuk 2 area coverage, sistem mengambil ongkos kirim yang termurah.



---

12. Checklist Migrasi 

12.1 Backend 

* 
**Database:** Buat migration untuk menghapus ItemJenisLayanan, ItemHarga, dan menambahkan JenisPerItem, DurasiPerItem, OrderPickup, OutletCoverage.


* 
**Database:** Update model Order untuk menambahkan jenis_order enum dan relasi ke OrderPickup.


* 
**Database:** Update model OrderItem — hapus item_harga_id, tambahkan jenis_per_item_id, durasi_per_item_id, harga_satuan, subtotal.


* 
**Database:** Hapus field tipe dari JenisLayanan.


* 
**Routes:** Update semua route `/outlet/layanan/*` dan `/customer/outlets/:id/layanan/*` sesuai struktur baru.


* 
**Controllers:** Buat controller baru untuk JenisPerItem, DurasiPerItem, OutletCoverage, OrderPickup.


* 
**Validation:** Update schema validasi Zod untuk body Create Order Per Item (tambahkan jenis_per_item_id, durasi_per_item_id di tiap item).


* 
**Business Logic:** Implementasi Haversine check di Create Order Antar Jemput.



12.2 Android (Mobile App) 

* Update API call layanan dari endpoint lama ke endpoint baru (`/per-kg` dan `/per-item`).


* Tambah screen pemilihan jenis layanan per item dan durasi per item dalam flow booking.


* Tambah jenis_per_item_id dan durasi_per_item_id ke payload Create Order per_item.


* Tambah screen pemilihan jenis_order (Drop & Go vs Antar Jemput).


* Tambah form input alamat pickup + jadwal jemput untuk jenis_order antar_jemput.



12.3 Dashboard (Web) 

* Update halaman Setup Layanan: pisahkan section Per KG dan Per Item.


* Update section Per Item: tambah sub-menu Jenis Layanan per Item dan Durasi per Jenis.


* Hapus field tipe dari form Create Jenis Layanan.


* Tambah halaman Coverage Antar Jemput.


* Tambah tampilan dan aksi untuk order antar jemput (konfirmasi, assign kurir, dll).



---

Apakah Anda memerlukan bantuan lain terkait implementasi migrasi ini?