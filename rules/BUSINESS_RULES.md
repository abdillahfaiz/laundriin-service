# BUSINESS RULES - Laundry Drop and Go
Dokumen ini berisi semua aturan bisnis yang WAJIB diikuti saat generate code.
Label [CRITICAL] = melanggarnya menyebabkan bug serius.

---

## 1. AUTHENTICATION AND AUTHORIZATION

### 1.1 Role Hierarchy
- superadmin   : akses semua endpoint
- admin_outlet : akses semua endpoint /outlet/* milik outletnya sendiri
- kasir        : akses terbatas hanya /outlet/orders/* dan /outlet/dashboard
- customer     : akses semua endpoint /customer/*

### 1.2 JWT Payload
{
  "userId": "uuid",
  "role": "customer | kasir | admin_outlet | superadmin",
  "outletId": "uuid | null"
}
outletId diisi untuk kasir dan admin_outlet, null untuk customer dan superadmin.

### 1.3 Auth Rules
- [CRITICAL] Kasir HANYA bisa akses order dari outletnya sendiri (cek outletId di JWT vs order.outlet_id)
- [CRITICAL] Admin outlet HANYA bisa manage data outletnya sendiri
- Password di-hash dengan bcrypt saltRounds: 12
- Access token expire: 15 menit
- Refresh token expire: 7 hari
- Logout: simpan refresh token ke blacklist

---

## 2. ORDER RULES

### 2.1 Tipe PER_KG
Flow: Customer booking (tanpa berat) -> Dapat QR -> Drop ke outlet -> Kasir scan QR
      -> Kasir input berat_aktual + foto_timbangan -> Backend hitung total_harga_final
      -> Notif tagihan ke customer -> Customer bayar -> Laundry diproses

Kalkulasi: total_harga_final = (berat_aktual x durasi_layanan.harga) + parfum.harga
Jika tidak pilih parfum: parfum.harga = 0

### 2.2 Tipe PER_ITEM
Flow: Customer booking + pilih items (item_layanan_id, durasi_layanan_id, qty)
      -> total_harga_final dihitung langsung saat booking -> Dapat QR
      -> Drop ke outlet -> Kasir scan QR -> Kasir TIDAK input berat
      -> Kasir konfirmasi item diterima -> Status: menunggu_pembayaran
      -> Notif tagihan ke customer -> Customer bayar

Kalkulasi: subtotal = item_harga.harga x qty per item
           total_harga_final = SUM(semua subtotal) + parfum.harga
item_harga.harga dari tabel item_harga berdasarkan (item_layanan_id x durasi_layanan_id)

### 2.3 Order Status Flow
menunggu_drop
  -> kasir proses (input berat untuk per_kg / konfirmasi item untuk per_item)
menunggu_pembayaran
  -> webhook Midtrans settlement
sedang_diproses
  -> kasir update manual
siap_diambil
  -> kasir update manual
selesai

Cancel path:
- menunggu_drop -> dibatalkan (customer cancel sebelum drop)
- menunggu_pembayaran -> dibatalkan (payment expire/cancel)

[CRITICAL] Status TIDAK BOLEH loncat, harus urut.
[CRITICAL] Setiap update status WAJIB dicatat di tabel order_status_log.
Setiap perubahan status WAJIB trigger push notification ke customer.

### 2.4 Walk-in Order
- [CRITICAL] is_walkin = true
- Walk-in per_kg: kasir langsung input berat_aktual saat create order
- Walk-in status awal: menunggu_pembayaran (skip menunggu_drop)
- Cek nomor telepon customer di DB:
  - Ada: gunakan user existing (isi customer_id)
  - Belum ada: buat user baru, role: customer, password: random UUID
- Kirim notifikasi jika customer punya fcm_token

### 2.5 QR Code
- Isi QR: transaction_id (bukan order.id)
- Format transaction_id: TRX-{YYYYMMDD}-{6 karakter alphanumeric uppercase}
- Contoh: TRX-20250601-A3X9KL
- Simpan sebagai base64 PNG di orders.qr_code
- Generate: await QRCode.toDataURL(transaction_id)

### 2.6 Berat Aktual
- [CRITICAL] Hanya untuk tipe_layanan = per_kg
- Minimum: 0.1 kg, Maksimum: 100 kg
- Wajib disertai foto_timbangan (URL Cloudinary)
- [CRITICAL] total_harga_final dihitung BACKEND, bukan dikirim frontend

---

## 3. PAYMENT RULES

### 3.1 Create Payment
- [CRITICAL] total_harga_final diambil dari orders.total_harga_final di DB, bukan dari request customer
- Hanya bisa dibuat jika order.status = menunggu_pembayaran
- Satu order hanya boleh punya SATU payment aktif (status pending)
- Boleh buat payment baru jika payment lama sudah expire atau cancel

### 3.2 Midtrans Integration
- [CRITICAL] Gunakan Core API via axios langsung, BUKAN midtrans-client package atau Snap SDK
- Sandbox: https://api.sandbox.midtrans.com/v2
- Auth header: "Basic " + Buffer.from(SERVER_KEY + ":").toString("base64")

Mapping metode_pembayaran ke Midtrans request body:
- bca_va     : { payment_type: "bank_transfer", bank_transfer: { bank: "bca" } }
- bni_va     : { payment_type: "bank_transfer", bank_transfer: { bank: "bni" } }
- bri_va     : { payment_type: "bank_transfer", bank_transfer: { bank: "bri" } }
- mandiri_va : { payment_type: "bank_transfer", bank_transfer: { bank: "mandiri" } }
- gopay      : { payment_type: "gopay" }
- qris       : { payment_type: "qris", qris: { acquirer: "gopay" } }
- shopeepay  : { payment_type: "shopeepay" }

Ambil data dari response Midtrans:
- VA: va_number = response.va_numbers[0].va_number
- GoPay/QRIS: qris_url = response.actions.find(a => a.name === "generate-qr-code").url
- Expiry: new Date(response.expiry_time)

### 3.3 Webhook Midtrans
- [CRITICAL] Verifikasi signature WAJIB sebelum proses apapun
- Formula: SHA512(order_id + status_code + gross_amount + SERVER_KEY)
- Signature tidak cocok: return 403

Logic berdasarkan transaction_status:
"settlement":
  1. payments.status = settlement, paid_at = now()
  2. orders.status = sedang_diproses
  3. Catat order_status_log
  4. outlets.saldo += total_harga_final
  5. Catat saldo_log (tipe: kredit, referensi_id: payment.id)
  6. Push notif customer: "Pembayaran berhasil! Laundry sedang diproses."

"expire":
  1. payments.status = expire
  2. orders.status = dibatalkan
  3. Push notif customer: "Pembayaran expired. Silakan buat order baru."

"cancel" / "deny":
  1. payments.status = cancel/deny
  2. orders.status = dibatalkan
  3. Push notif customer

### 3.4 Check Status Manual
- POST /customer/orders/:id/payment/check
- Hit Midtrans GET /v2/{midtrans_order_id}/status
- Jika settlement: jalankan logic sama seperti webhook (fallback)

---

## 4. SALDO DAN PENCAIRAN

### 4.1 Saldo Outlet
- Saldo bertambah HANYA saat webhook settlement diterima
- Setiap perubahan saldo WAJIB dicatat di saldo_log

### 4.2 Request Pencairan
- [CRITICAL] Validasi: jumlah <= outlets.saldo
- [CRITICAL] Max 1 request pending/diproses per outlet dalam satu waktu
- Minimum pencairan: Rp 50.000
- Saat request dibuat: outlets.saldo -= jumlah (hold), catat saldo_log debit
- Jika ditolak: outlets.saldo += jumlah (kembalikan), catat saldo_log kredit
- Jika berhasil: upload bukti_transfer ke Cloudinary, saldo tidak berubah

---

## 5. OUTLET RULES

### 5.1 Status
- Default: pending. Muncul di customer hanya jika status = aktif
- Outlet nonaktif tidak bisa menerima order baru

### 5.2 Nearby Outlet
- Gunakan Haversine formula untuk hitung jarak
- Default radius: 10 km
- Response include field jarak_km (2 desimal) dan is_buka (boolean)
- Urutkan dari terdekat

### 5.3 Setup Layanan
- Data layanan per-outlet, tidak shared
- Delete = soft delete (is_active = false), jangan hapus dari DB
- [CRITICAL] Jika jenis_layanan nonaktif, durasi dan item di bawahnya tidak muncul di endpoint customer

---

## 6. NOTIFICATION RULES

### 6.1 Trigger Events
- Kasir input berat (per_kg)       -> notif customer: tagihan
- Kasir konfirmasi item (per_item) -> notif customer: tagihan
- Payment settlement               -> notif customer: pembayaran berhasil
- Status: siap_diambil             -> notif customer: laundry siap
- Payment expire                   -> notif customer: expired
- Pencairan berhasil               -> notif admin_outlet
- Pencairan ditolak                -> notif admin_outlet

### 6.2 Aturan
- Setiap notif WAJIB disimpan ke tabel notifications
- Jika fcm_token null: simpan ke DB, skip FCM
- [CRITICAL] FCM gagal: log error saja, JANGAN gagalkan main process

---

## 7. VALIDASI

- Nomor telepon: /^08[0-9]{8,11}$/, unik di tabel users
- Password: min 8, max 100 karakter
- Latitude: -90 sampai 90
- Longitude: -180 sampai 180
- Berat: min 0.1, max 100 kg
- Harga: tidak boleh negatif, Decimal(12,2)
- QTY item: min 1, max 99
