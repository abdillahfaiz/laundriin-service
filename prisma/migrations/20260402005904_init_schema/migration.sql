-- CreateEnum
CREATE TYPE "Role" AS ENUM ('customer', 'kasir', 'admin_outlet', 'superadmin');

-- CreateEnum
CREATE TYPE "OutletStatus" AS ENUM ('pending', 'aktif', 'nonaktif');

-- CreateEnum
CREATE TYPE "HariEnum" AS ENUM ('senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu');

-- CreateEnum
CREATE TYPE "TipeLayanan" AS ENUM ('per_kg', 'per_item');

-- CreateEnum
CREATE TYPE "JenisOrder" AS ENUM ('drop_and_go', 'antar_jemput');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('menunggu_ditimbang', 'sedang_diproses', 'selesai', 'dibatalkan', 'menunggu_drop', 'siap_diambil', 'menunggu_konfirmasi', 'dikonfirmasi', 'kurir_menuju', 'barang_dijemput', 'siap_diantar', 'sedang_diantar');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'settlement', 'expire', 'cancel', 'deny');

-- CreateEnum
CREATE TYPE "PencairanStatus" AS ENUM ('pending', 'diproses', 'berhasil', 'ditolak');

-- CreateEnum
CREATE TYPE "NotifikasiTipe" AS ENUM ('tagihan', 'status_order', 'pembayaran', 'pencairan');

-- CreateEnum
CREATE TYPE "SaldoTipe" AS ENUM ('kredit', 'debit');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "nama" VARCHAR(100) NOT NULL,
    "nomor_telepon" VARCHAR(20) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'customer',
    "fcm_token" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outlets" (
    "id" TEXT NOT NULL,
    "admin_id" TEXT NOT NULL,
    "nama_outlet" VARCHAR(150) NOT NULL,
    "alamat" TEXT NOT NULL,
    "foto_outlet" TEXT,
    "lat" DECIMAL(10,8) NOT NULL,
    "lng" DECIMAL(11,8) NOT NULL,
    "status" "OutletStatus" NOT NULL DEFAULT 'pending',
    "saldo" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "outlets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outlet_operasional" (
    "id" TEXT NOT NULL,
    "outlet_id" TEXT NOT NULL,
    "hari" "HariEnum" NOT NULL,
    "jam_buka" VARCHAR(5) NOT NULL,
    "jam_tutup" VARCHAR(5) NOT NULL,
    "is_open" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "outlet_operasional_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outlet_kasir" (
    "id" TEXT NOT NULL,
    "outlet_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "outlet_kasir_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jenis_layanan" (
    "id" TEXT NOT NULL,
    "outlet_id" TEXT NOT NULL,
    "nama" VARCHAR(100) NOT NULL,
    "deskripsi" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jenis_layanan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "durasi_layanan" (
    "id" TEXT NOT NULL,
    "jenis_layanan_id" TEXT NOT NULL,
    "nama" VARCHAR(100) NOT NULL,
    "estimasi_jam" INTEGER NOT NULL,
    "harga" DECIMAL(12,2) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "durasi_layanan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_layanan" (
    "id" TEXT NOT NULL,
    "outlet_id" TEXT NOT NULL,
    "nama_item" VARCHAR(100) NOT NULL,
    "foto_item" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "item_layanan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jenis_per_item" (
    "id" TEXT NOT NULL,
    "item_layanan_id" TEXT NOT NULL,
    "nama" VARCHAR(100) NOT NULL,
    "deskripsi" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jenis_per_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "durasi_per_item" (
    "id" TEXT NOT NULL,
    "jenis_per_item_id" TEXT NOT NULL,
    "nama" VARCHAR(100) NOT NULL,
    "estimasi_jam" INTEGER NOT NULL,
    "harga" DECIMAL(12,2) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "durasi_per_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parfum" (
    "id" TEXT NOT NULL,
    "outlet_id" TEXT NOT NULL,
    "nama" VARCHAR(100) NOT NULL,
    "harga" DECIMAL(10,2) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parfum_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "transaction_id" VARCHAR(50) NOT NULL,
    "customer_id" TEXT NOT NULL,
    "outlet_id" TEXT NOT NULL,
    "kasir_id" TEXT,
    "tipe_layanan" "TipeLayanan" NOT NULL,
    "jenis_order" "JenisOrder" NOT NULL DEFAULT 'drop_and_go',
    "jenis_layanan_id" TEXT,
    "durasi_layanan_id" TEXT,
    "parfum_id" TEXT,
    "special_notes" TEXT,
    "berat_aktual" DECIMAL(8,2),
    "foto_timbangan" TEXT,
    "total_harga_final" DECIMAL(12,2),
    "status" "OrderStatus" NOT NULL DEFAULT 'menunggu_drop',
    "is_walkin" BOOLEAN NOT NULL DEFAULT false,
    "qr_code" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "item_layanan_id" TEXT NOT NULL,
    "jenis_per_item_id" TEXT NOT NULL,
    "durasi_per_item_id" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "harga_satuan" DECIMAL(12,2) NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_status_log" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "changed_by" TEXT NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_status_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "midtrans_order_id" VARCHAR(100) NOT NULL,
    "metode_pembayaran" VARCHAR(50) NOT NULL,
    "va_number" VARCHAR(50),
    "qris_url" TEXT,
    "total_bayar" DECIMAL(12,2) NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "expired_at" TIMESTAMP(3),
    "paid_at" TIMESTAMP(3),
    "midtrans_response" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pencairan_saldo" (
    "id" TEXT NOT NULL,
    "outlet_id" TEXT NOT NULL,
    "jumlah" DECIMAL(15,2) NOT NULL,
    "nomor_rekening" VARCHAR(50) NOT NULL,
    "nama_pemilik_rekening" VARCHAR(100) NOT NULL,
    "bank_tujuan" VARCHAR(50) NOT NULL,
    "status" "PencairanStatus" NOT NULL DEFAULT 'pending',
    "bukti_transfer" TEXT,
    "catatan_admin" TEXT,
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pencairan_saldo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "order_id" TEXT,
    "judul" VARCHAR(200) NOT NULL,
    "pesan" TEXT NOT NULL,
    "tipe" "NotifikasiTipe" NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saldo_log" (
    "id" TEXT NOT NULL,
    "outlet_id" TEXT NOT NULL,
    "tipe" "SaldoTipe" NOT NULL,
    "jumlah" DECIMAL(15,2) NOT NULL,
    "saldo_sebelum" DECIMAL(15,2) NOT NULL,
    "saldo_sesudah" DECIMAL(15,2) NOT NULL,
    "referensi_id" UUID,
    "keterangan" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saldo_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_pickup" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "alamat_pickup" TEXT NOT NULL,
    "lat_pickup" DOUBLE PRECISION NOT NULL,
    "lng_pickup" DOUBLE PRECISION NOT NULL,
    "alamat_antar" TEXT,
    "lat_antar" DOUBLE PRECISION,
    "lng_antar" DOUBLE PRECISION,
    "jadwal_jemput" TIMESTAMP(3) NOT NULL,
    "kurir_id" TEXT,
    "ongkos_kirim" DECIMAL(12,2) NOT NULL,
    "foto_barang_pickup" TEXT,
    "catatan_alamat" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_pickup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outlet_coverage" (
    "id" TEXT NOT NULL,
    "outlet_id" TEXT NOT NULL,
    "nama_area" VARCHAR(150) NOT NULL,
    "max_radius_km" DOUBLE PRECISION NOT NULL,
    "ongkos_kirim" DECIMAL(12,2) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "outlet_coverage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_nomor_telepon_key" ON "users"("nomor_telepon");

-- CreateIndex
CREATE UNIQUE INDEX "outlets_admin_id_key" ON "outlets"("admin_id");

-- CreateIndex
CREATE UNIQUE INDEX "outlet_operasional_outlet_id_hari_key" ON "outlet_operasional"("outlet_id", "hari");

-- CreateIndex
CREATE UNIQUE INDEX "outlet_kasir_outlet_id_user_id_key" ON "outlet_kasir"("outlet_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "orders_transaction_id_key" ON "orders"("transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_order_id_key" ON "payments"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_midtrans_order_id_key" ON "payments"("midtrans_order_id");

-- CreateIndex
CREATE UNIQUE INDEX "order_pickup_order_id_key" ON "order_pickup"("order_id");

-- AddForeignKey
ALTER TABLE "outlets" ADD CONSTRAINT "outlets_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outlet_operasional" ADD CONSTRAINT "outlet_operasional_outlet_id_fkey" FOREIGN KEY ("outlet_id") REFERENCES "outlets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outlet_kasir" ADD CONSTRAINT "outlet_kasir_outlet_id_fkey" FOREIGN KEY ("outlet_id") REFERENCES "outlets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outlet_kasir" ADD CONSTRAINT "outlet_kasir_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jenis_layanan" ADD CONSTRAINT "jenis_layanan_outlet_id_fkey" FOREIGN KEY ("outlet_id") REFERENCES "outlets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "durasi_layanan" ADD CONSTRAINT "durasi_layanan_jenis_layanan_id_fkey" FOREIGN KEY ("jenis_layanan_id") REFERENCES "jenis_layanan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_layanan" ADD CONSTRAINT "item_layanan_outlet_id_fkey" FOREIGN KEY ("outlet_id") REFERENCES "outlets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jenis_per_item" ADD CONSTRAINT "jenis_per_item_item_layanan_id_fkey" FOREIGN KEY ("item_layanan_id") REFERENCES "item_layanan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "durasi_per_item" ADD CONSTRAINT "durasi_per_item_jenis_per_item_id_fkey" FOREIGN KEY ("jenis_per_item_id") REFERENCES "jenis_per_item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parfum" ADD CONSTRAINT "parfum_outlet_id_fkey" FOREIGN KEY ("outlet_id") REFERENCES "outlets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_outlet_id_fkey" FOREIGN KEY ("outlet_id") REFERENCES "outlets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_kasir_id_fkey" FOREIGN KEY ("kasir_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_jenis_layanan_id_fkey" FOREIGN KEY ("jenis_layanan_id") REFERENCES "jenis_layanan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_durasi_layanan_id_fkey" FOREIGN KEY ("durasi_layanan_id") REFERENCES "durasi_layanan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_parfum_id_fkey" FOREIGN KEY ("parfum_id") REFERENCES "parfum"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_item_layanan_id_fkey" FOREIGN KEY ("item_layanan_id") REFERENCES "item_layanan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_jenis_per_item_id_fkey" FOREIGN KEY ("jenis_per_item_id") REFERENCES "jenis_per_item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_durasi_per_item_id_fkey" FOREIGN KEY ("durasi_per_item_id") REFERENCES "durasi_per_item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_status_log" ADD CONSTRAINT "order_status_log_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_status_log" ADD CONSTRAINT "order_status_log_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pencairan_saldo" ADD CONSTRAINT "pencairan_saldo_outlet_id_fkey" FOREIGN KEY ("outlet_id") REFERENCES "outlets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pencairan_saldo" ADD CONSTRAINT "pencairan_saldo_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saldo_log" ADD CONSTRAINT "saldo_log_outlet_id_fkey" FOREIGN KEY ("outlet_id") REFERENCES "outlets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_pickup" ADD CONSTRAINT "order_pickup_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_pickup" ADD CONSTRAINT "order_pickup_kurir_id_fkey" FOREIGN KEY ("kurir_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outlet_coverage" ADD CONSTRAINT "outlet_coverage_outlet_id_fkey" FOREIGN KEY ("outlet_id") REFERENCES "outlets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
