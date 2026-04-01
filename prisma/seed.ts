// prisma/seed.ts
// ============================================
// SEEDER — Laundriin Service
// Jalankan: npx ts-node prisma/seed.ts
// Atau via: npx prisma db seed
// ============================================

import { PrismaClient, Role, OutletStatus, HariEnum } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// ==========================================
// HELPER
// ==========================================

const hashPassword = async (plain: string): Promise<string> => {
  return bcrypt.hash(plain, 12)  // saltRounds: 12
}

// ==========================================
// MAIN SEED
// ==========================================

async function main() {
  console.log('🌱 Starting seed...\n')

  // ----------------------------------------
  // 1. USERS
  // ----------------------------------------
  console.log('👤 Seeding users...')

  const superadmin = await prisma.user.upsert({
    where: { nomor_telepon: '08000000001' },
    update: {},
    create: {
      nama: 'Super Admin',
      nomor_telepon: '08000000001',
      password: await hashPassword('superadmin123'),
      role: Role.superadmin,
      is_active: true,
    },
  })

  const adminOutlet = await prisma.user.upsert({
    where: { nomor_telepon: '08111111111' },
    update: {},
    create: {
      nama: 'Ahmad Pemilik',
      nomor_telepon: '08111111111',
      password: await hashPassword('admin123'),
      role: Role.admin_outlet,
      is_active: true,
    },
  })

  const kasir1 = await prisma.user.upsert({
    where: { nomor_telepon: '08222222222' },
    update: {},
    create: {
      nama: 'Siti Rahma',
      nomor_telepon: '08222222222',
      password: await hashPassword('kasir123'),
      role: Role.kasir,
      is_active: true,
    },
  })

  const kasir2 = await prisma.user.upsert({
    where: { nomor_telepon: '08333333333' },
    update: {},
    create: {
      nama: 'Rudi Kurir',
      nomor_telepon: '08333333333',
      password: await hashPassword('kasir123'),
      role: Role.kasir,
      is_active: true,
    },
  })

  const customer1 = await prisma.user.upsert({
    where: { nomor_telepon: '08123456789' },
    update: {},
    create: {
      nama: 'Budi Santoso',
      nomor_telepon: '08123456789',
      password: await hashPassword('customer123'),
      role: Role.customer,
      is_active: true,
    },
  })

  const customer2 = await prisma.user.upsert({
    where: { nomor_telepon: '08198765432' },
    update: {},
    create: {
      nama: 'Sari Dewi',
      nomor_telepon: '08198765432',
      password: await hashPassword('customer123'),
      role: Role.customer,
      is_active: true,
    },
  })

  const customer3 = await prisma.user.upsert({
    where: { nomor_telepon: '08155551234' },
    update: {},
    create: {
      nama: 'Dian Nugraha',
      nomor_telepon: '08155551234',
      password: await hashPassword('customer123'),
      role: Role.customer,
      is_active: true,
    },
  })

  console.log('  ✓ 7 users created\n')

  // ----------------------------------------
  // 2. OUTLET
  // ----------------------------------------
  console.log('🏪 Seeding outlet...')

  const outlet = await prisma.outlet.upsert({
    where: { admin_id: adminOutlet.id },
    update: {},
    create: {
      admin_id: adminOutlet.id,
      nama_outlet: 'Laundry Amanah Baleendah',
      alamat: 'Jl. Raya Baleendah No. 10, Baleendah, Kabupaten Bandung',
      lat: -6.9824,
      lng: 107.6301,
      status: OutletStatus.aktif,
      saldo: 4250000,
    },
  })

  // Outlet kedua (masih pending, untuk test superadmin)
  const outlet2 = await prisma.user.upsert({
    where: { nomor_telepon: '08444444444' },
    update: {},
    create: {
      nama: 'Budi Laundry',
      nomor_telepon: '08444444444',
      password: await hashPassword('admin123'),
      role: Role.admin_outlet,
      is_active: true,
    },
  })

  await prisma.outlet.upsert({
    where: { admin_id: outlet2.id },
    update: {},
    create: {
      admin_id: outlet2.id,
      nama_outlet: 'Laundry Bersih Ceria',
      alamat: 'Jl. Soekarno Hatta No. 55, Bandung',
      lat: -6.9505,
      lng: 107.6355,
      status: OutletStatus.pending,
      saldo: 0,
    },
  })

  console.log('  ✓ 2 outlets created\n')

  // ----------------------------------------
  // 3. OUTLET KASIR
  // ----------------------------------------
  console.log('👷 Seeding outlet kasir...')

  await prisma.outletKasir.upsert({
    where: { outlet_id_user_id: { outlet_id: outlet.id, user_id: kasir1.id } },
    update: {},
    create: {
      outlet_id: outlet.id,
      user_id: kasir1.id,
      is_active: true,
    },
  })

  await prisma.outletKasir.upsert({
    where: { outlet_id_user_id: { outlet_id: outlet.id, user_id: kasir2.id } },
    update: {},
    create: {
      outlet_id: outlet.id,
      user_id: kasir2.id,
      is_active: true,
    },
  })

  console.log('  ✓ 2 kasir assigned\n')

  // ----------------------------------------
  // 4. JAM OPERASIONAL
  // ----------------------------------------
  console.log('🕐 Seeding jam operasional...')

  const jamOperasional = [
    { hari: HariEnum.senin,   jam_buka: '08:00', jam_tutup: '21:00', is_open: true },
    { hari: HariEnum.selasa,  jam_buka: '08:00', jam_tutup: '21:00', is_open: true },
    { hari: HariEnum.rabu,    jam_buka: '08:00', jam_tutup: '21:00', is_open: true },
    { hari: HariEnum.kamis,   jam_buka: '08:00', jam_tutup: '21:00', is_open: true },
    { hari: HariEnum.jumat,   jam_buka: '08:00', jam_tutup: '21:00', is_open: true },
    { hari: HariEnum.sabtu,   jam_buka: '08:00', jam_tutup: '20:00', is_open: true },
    { hari: HariEnum.minggu,  jam_buka: '09:00', jam_tutup: '18:00', is_open: false },
  ]

  for (const jam of jamOperasional) {
    await prisma.outletOperasional.upsert({
      where: { outlet_id_hari: { outlet_id: outlet.id, hari: jam.hari } },
      update: {},
      create: { outlet_id: outlet.id, ...jam },
    })
  }

  console.log('  ✓ 7 hari operasional created\n')

  // ----------------------------------------
  // 5. PARFUM
  // ----------------------------------------
  console.log('🌸 Seeding parfum...')

  const parfumList = [
    { nama: 'Mawar',      harga: 2000 },
    { nama: 'Lavender',   harga: 2000 },
    { nama: 'Lemon Fresh',harga: 3000 },
    { nama: 'Green Tea',  harga: 3000, is_active: false },
    { nama: 'Vanilla',    harga: 3000 },
  ]

  const createdParfum: Record<string, any> = {}
  for (const p of parfumList) {
    const existing = await prisma.parfum.findFirst({
      where: { outlet_id: outlet.id, nama: p.nama }
    })
    if (!existing) {
      const parfum = await prisma.parfum.create({
        data: {
          outlet_id: outlet.id,
          nama: p.nama,
          harga: p.harga,
          is_active: p.is_active ?? true,
        }
      })
      createdParfum[p.nama] = parfum
    } else {
      createdParfum[p.nama] = existing
    }
  }

  console.log('  ✓ 5 parfum created\n')

  // ----------------------------------------
  // 6. JENIS LAYANAN PER KG + DURASI
  // ----------------------------------------
  console.log('🧺 Seeding layanan Per KG...')

  // Jenis 1: Cuci + Setrika
  let jenisCS = await prisma.jenisLayanan.findFirst({
    where: { outlet_id: outlet.id, nama: 'Cuci + Setrika' }
  })
  if (!jenisCS) {
    jenisCS = await prisma.jenisLayanan.create({
      data: {
        outlet_id: outlet.id,
        nama: 'Cuci + Setrika',
        deskripsi: 'Layanan cuci bersih + setrika rapi',
        is_active: true,
      }
    })
  }

  const durasiCS = [
    { nama: 'Super Express', estimasi_jam: 4,  harga: 18000 },
    { nama: 'Express',       estimasi_jam: 8,  harga: 12000 },
    { nama: 'Reguler',       estimasi_jam: 24, harga: 8000  },
  ]
  for (const d of durasiCS) {
    const exists = await prisma.durasiLayanan.findFirst({
      where: { jenis_layanan_id: jenisCS.id, nama: d.nama }
    })
    if (!exists) {
      await prisma.durasiLayanan.create({
        data: { jenis_layanan_id: jenisCS.id, nama: d.nama, estimasi_jam: d.estimasi_jam, harga: d.harga }
      })
    }
  }

  // Jenis 2: Cuci Saja
  let jenisCuci = await prisma.jenisLayanan.findFirst({
    where: { outlet_id: outlet.id, nama: 'Cuci Saja' }
  })
  if (!jenisCuci) {
    jenisCuci = await prisma.jenisLayanan.create({
      data: {
        outlet_id: outlet.id,
        nama: 'Cuci Saja',
        deskripsi: 'Layanan cuci tanpa setrika',
        is_active: true,
      }
    })
  }

  const durasiCuci = [
    { nama: 'Express', estimasi_jam: 8,  harga: 8000 },
    { nama: 'Reguler', estimasi_jam: 24, harga: 6000 },
  ]
  for (const d of durasiCuci) {
    const exists = await prisma.durasiLayanan.findFirst({
      where: { jenis_layanan_id: jenisCuci.id, nama: d.nama }
    })
    if (!exists) {
      await prisma.durasiLayanan.create({
        data: { jenis_layanan_id: jenisCuci.id, nama: d.nama, estimasi_jam: d.estimasi_jam, harga: d.harga }
      })
    }
  }

  // Jenis 3: Setrika Saja
  let jenisSetrika = await prisma.jenisLayanan.findFirst({
    where: { outlet_id: outlet.id, nama: 'Setrika Saja' }
  })
  if (!jenisSetrika) {
    jenisSetrika = await prisma.jenisLayanan.create({
      data: {
        outlet_id: outlet.id,
        nama: 'Setrika Saja',
        deskripsi: 'Hanya setrika, tanpa cuci',
        is_active: true,
      }
    })
  }

  const existsSetrika = await prisma.durasiLayanan.findFirst({
    where: { jenis_layanan_id: jenisSetrika.id, nama: 'Reguler' }
  })
  if (!existsSetrika) {
    await prisma.durasiLayanan.create({
      data: { jenis_layanan_id: jenisSetrika.id, nama: 'Reguler', estimasi_jam: 6, harga: 5000 }
    })
  }

  console.log('  ✓ 3 jenis layanan per_kg + durasi created\n')

  // ----------------------------------------
  // 7. ITEM LAYANAN + JENIS PER ITEM + DURASI PER ITEM
  // ----------------------------------------
  console.log('👟 Seeding layanan Per Item...')

  // ------ ITEM: Sepatu Biasa ------
  let itemSepatu = await prisma.itemLayanan.findFirst({
    where: { outlet_id: outlet.id, nama_item: 'Sepatu Biasa' }
  })
  if (!itemSepatu) {
    itemSepatu = await prisma.itemLayanan.create({
      data: { outlet_id: outlet.id, nama_item: 'Sepatu Biasa', is_active: true }
    })
  }

  // JenisPerItem: Cuci Biasa (milik Sepatu Biasa)
  let jenisSB_CuciB = await prisma.jenisPerItem.findFirst({
    where: { item_layanan_id: itemSepatu.id, nama: 'Cuci Biasa' }
  })
  if (!jenisSB_CuciB) {
    jenisSB_CuciB = await prisma.jenisPerItem.create({
      data: { item_layanan_id: itemSepatu.id, nama: 'Cuci Biasa', is_active: true }
    })
  }
  for (const d of [
    { nama: 'Express', estimasi_jam: 8,  harga: 25000 },
    { nama: 'Reguler', estimasi_jam: 24, harga: 18000 },
  ]) {
    const ex = await prisma.durasiPerItem.findFirst({ where: { jenis_per_item_id: jenisSB_CuciB.id, nama: d.nama } })
    if (!ex) await prisma.durasiPerItem.create({ data: { jenis_per_item_id: jenisSB_CuciB.id, ...d } })
  }

  // JenisPerItem: Cuci Premium (milik Sepatu Biasa)
  let jenisSB_CuciP = await prisma.jenisPerItem.findFirst({
    where: { item_layanan_id: itemSepatu.id, nama: 'Cuci Premium' }
  })
  if (!jenisSB_CuciP) {
    jenisSB_CuciP = await prisma.jenisPerItem.create({
      data: { item_layanan_id: itemSepatu.id, nama: 'Cuci Premium', deskripsi: 'Cuci deep cleaning + pengkilap', is_active: true }
    })
  }
  for (const d of [
    { nama: 'Express', estimasi_jam: 8,  harga: 40000 },
    { nama: 'Reguler', estimasi_jam: 24, harga: 30000 },
  ]) {
    const ex = await prisma.durasiPerItem.findFirst({ where: { jenis_per_item_id: jenisSB_CuciP.id, nama: d.nama } })
    if (!ex) await prisma.durasiPerItem.create({ data: { jenis_per_item_id: jenisSB_CuciP.id, ...d } })
  }

  // ------ ITEM: Sepatu Boot ------
  let itemBoot = await prisma.itemLayanan.findFirst({
    where: { outlet_id: outlet.id, nama_item: 'Sepatu Boot' }
  })
  if (!itemBoot) {
    itemBoot = await prisma.itemLayanan.create({
      data: { outlet_id: outlet.id, nama_item: 'Sepatu Boot', is_active: true }
    })
  }

  let jenisBoot_CuciB = await prisma.jenisPerItem.findFirst({
    where: { item_layanan_id: itemBoot.id, nama: 'Cuci Biasa' }
  })
  if (!jenisBoot_CuciB) {
    jenisBoot_CuciB = await prisma.jenisPerItem.create({
      data: { item_layanan_id: itemBoot.id, nama: 'Cuci Biasa', is_active: true }
    })
  }
  for (const d of [
    { nama: 'Express', estimasi_jam: 8,  harga: 40000 },
    { nama: 'Reguler', estimasi_jam: 24, harga: 30000 },
  ]) {
    const ex = await prisma.durasiPerItem.findFirst({ where: { jenis_per_item_id: jenisBoot_CuciB.id, nama: d.nama } })
    if (!ex) await prisma.durasiPerItem.create({ data: { jenis_per_item_id: jenisBoot_CuciB.id, ...d } })
  }

  // ------ ITEM: Selimut ------
  let itemSelimut = await prisma.itemLayanan.findFirst({
    where: { outlet_id: outlet.id, nama_item: 'Selimut' }
  })
  if (!itemSelimut) {
    itemSelimut = await prisma.itemLayanan.create({
      data: { outlet_id: outlet.id, nama_item: 'Selimut', is_active: true }
    })
  }

  // Note: Selimut punya "Cuci Biasa" yang BERBEDA record dari Sepatu Biasa
  let jenisSelimut_CuciB = await prisma.jenisPerItem.findFirst({
    where: { item_layanan_id: itemSelimut.id, nama: 'Cuci Biasa' }
  })
  if (!jenisSelimut_CuciB) {
    jenisSelimut_CuciB = await prisma.jenisPerItem.create({
      data: { item_layanan_id: itemSelimut.id, nama: 'Cuci Biasa', is_active: true }
    })
  }
  for (const d of [
    { nama: 'Express', estimasi_jam: 8,  harga: 35000 },
    { nama: 'Reguler', estimasi_jam: 24, harga: 25000 },
  ]) {
    const ex = await prisma.durasiPerItem.findFirst({ where: { jenis_per_item_id: jenisSelimut_CuciB.id, nama: d.nama } })
    if (!ex) await prisma.durasiPerItem.create({ data: { jenis_per_item_id: jenisSelimut_CuciB.id, ...d } })
  }

  // ------ ITEM: Bantal ------
  let itemBantal = await prisma.itemLayanan.findFirst({
    where: { outlet_id: outlet.id, nama_item: 'Bantal' }
  })
  if (!itemBantal) {
    itemBantal = await prisma.itemLayanan.create({
      data: { outlet_id: outlet.id, nama_item: 'Bantal', is_active: true }
    })
  }

  let jenisBantal = await prisma.jenisPerItem.findFirst({
    where: { item_layanan_id: itemBantal.id, nama: 'Cuci Biasa' }
  })
  if (!jenisBantal) {
    jenisBantal = await prisma.jenisPerItem.create({
      data: { item_layanan_id: itemBantal.id, nama: 'Cuci Biasa', is_active: true }
    })
  }
  for (const d of [
    { nama: 'Express', estimasi_jam: 8,  harga: 20000 },
    { nama: 'Reguler', estimasi_jam: 24, harga: 15000 },
  ]) {
    const ex = await prisma.durasiPerItem.findFirst({ where: { jenis_per_item_id: jenisBantal.id, nama: d.nama } })
    if (!ex) await prisma.durasiPerItem.create({ data: { jenis_per_item_id: jenisBantal.id, ...d } })
  }

  // ------ ITEM: Karpet Kecil ------
  let itemKarpet = await prisma.itemLayanan.findFirst({
    where: { outlet_id: outlet.id, nama_item: 'Karpet Kecil' }
  })
  if (!itemKarpet) {
    itemKarpet = await prisma.itemLayanan.create({
      data: { outlet_id: outlet.id, nama_item: 'Karpet Kecil', is_active: true }
    })
  }

  let jenisKarpet = await prisma.jenisPerItem.findFirst({
    where: { item_layanan_id: itemKarpet.id, nama: 'Cuci Biasa' }
  })
  if (!jenisKarpet) {
    jenisKarpet = await prisma.jenisPerItem.create({
      data: { item_layanan_id: itemKarpet.id, nama: 'Cuci Biasa', is_active: true }
    })
  }
  for (const d of [
    { nama: 'Reguler', estimasi_jam: 48, harga: 30000 },
  ]) {
    const ex = await prisma.durasiPerItem.findFirst({ where: { jenis_per_item_id: jenisKarpet.id, nama: d.nama } })
    if (!ex) await prisma.durasiPerItem.create({ data: { jenis_per_item_id: jenisKarpet.id, ...d } })
  }

  console.log('  ✓ 5 item layanan + jenis + durasi created\n')

  // ----------------------------------------
  // 8. COVERAGE ANTAR JEMPUT
  // ----------------------------------------
  console.log('📍 Seeding coverage antar jemput...')

  const coverageList = [
    { nama_area: 'Baleendah & Sekitar',  max_radius_km: 5,  ongkos_kirim: 8000,  is_active: true },
    { nama_area: 'Bandung Selatan',      max_radius_km: 10, ongkos_kirim: 15000, is_active: true },
    { nama_area: 'Bandung Kota',         max_radius_km: 20, ongkos_kirim: 25000, is_active: true },
    { nama_area: 'Area Khusus Premium',  max_radius_km: 30, ongkos_kirim: 40000, is_active: false },
  ]

  for (const c of coverageList) {
    const exists = await prisma.outletCoverage.findFirst({
      where: { outlet_id: outlet.id, nama_area: c.nama_area }
    })
    if (!exists) {
      await prisma.outletCoverage.create({
        data: { outlet_id: outlet.id, ...c }
      })
    }
  }

  console.log('  ✓ 4 coverage area created\n')

  // ----------------------------------------
  // 9. SAMPLE ORDERS (untuk testing)
  // ----------------------------------------
  console.log('📋 Seeding sample orders...')

  // Ambil durasi untuk referensi
  const durasiExpress = await prisma.durasiLayanan.findFirst({
    where: { jenis_layanan_id: jenisCS.id, nama: 'Express' }
  })
  const durasiReguler = await prisma.durasiLayanan.findFirst({
    where: { jenis_layanan_id: jenisCuci.id, nama: 'Reguler' }
  })

  // Order 1: Per KG Drop & Go - Menunggu Drop
  const existingOrder1 = await prisma.order.findUnique({ where: { transaction_id: 'TRX-20250610-A3X9KL' } })
  if (!existingOrder1 && durasiExpress) {
    await prisma.order.create({
      data: {
        transaction_id: 'TRX-20250610-A3X9KL',
        customer_id: customer1.id,
        outlet_id: outlet.id,
        jenis_order: 'drop_and_go',
        tipe_layanan: 'per_kg',
        jenis_layanan_id: jenisCS.id,
        durasi_layanan_id: durasiExpress.id,
        parfum_id: createdParfum['Mawar']?.id,
        special_notes: 'Pisahkan baju putih',
        status: 'menunggu_drop',
        qr_code: 'TRX-20250610-A3X9KL',
        is_walkin: false,
      }
    })
  }

  // Order 2: Per Item Drop & Go - Sedang Diproses
  const durasiSepatuExpress = await prisma.durasiPerItem.findFirst({
    where: { jenis_per_item_id: jenisSB_CuciB.id, nama: 'Express' }
  })
  const existingOrder2 = await prisma.order.findUnique({ where: { transaction_id: 'TRX-20250610-B7KP2M' } })
  if (!existingOrder2 && durasiSepatuExpress) {
    const order2 = await prisma.order.create({
      data: {
        transaction_id: 'TRX-20250610-B7KP2M',
        customer_id: customer2.id,
        outlet_id: outlet.id,
        kasir_id: kasir1.id,
        jenis_order: 'drop_and_go',
        tipe_layanan: 'per_item',
        parfum_id: createdParfum['Lavender']?.id,
        total_harga_final: 72000,
        status: 'sedang_diproses',
        qr_code: 'TRX-20250610-B7KP2M',
        is_walkin: false,
        order_items: {
          create: [
            {
              item_layanan_id: itemSepatu.id,
              jenis_per_item_id: jenisSB_CuciB.id,
              durasi_per_item_id: durasiSepatuExpress.id,
              qty: 2,
              harga_satuan: 25000,
              subtotal: 50000,
            },
            {
              item_layanan_id: itemBantal.id,
              jenis_per_item_id: jenisBantal.id,
              durasi_per_item_id: (await prisma.durasiPerItem.findFirst({
                where: { jenis_per_item_id: jenisBantal.id, nama: 'Reguler' }
              }))!.id,
              qty: 1,
              harga_satuan: 20000,
              subtotal: 20000,
            }
          ]
        }
      }
    })

    // Buat payment untuk order 2
    await prisma.payment.create({
      data: {
        order_id: order2.id,
        midtrans_order_id: `TRX-20250610-B7KP2M-${Date.now()}`,
        metode_pembayaran: 'qris',
        total_bayar: 72000,
        status: 'settlement',
        paid_at: new Date('2025-06-10T13:15:00Z'),
      }
    })
  }

  // Order 3: Per KG Antar Jemput - Dikonfirmasi
  const existingOrder3 = await prisma.order.findUnique({ where: { transaction_id: 'TRX-20250610-C2MQ8N' } })
  if (!existingOrder3 && durasiReguler) {
    const order3 = await prisma.order.create({
      data: {
        transaction_id: 'TRX-20250610-C2MQ8N',
        customer_id: customer3.id,
        outlet_id: outlet.id,
        jenis_order: 'antar_jemput',
        tipe_layanan: 'per_kg',
        jenis_layanan_id: jenisCuci.id,
        durasi_layanan_id: durasiReguler.id,
        parfum_id: createdParfum['Lavender']?.id,
        status: 'dikonfirmasi',
        qr_code: 'TRX-20250610-C2MQ8N',
        is_walkin: false,
      }
    })

    // Buat pickup record
    await prisma.orderPickup.create({
      data: {
        order_id: order3.id,
        alamat_pickup: 'Jl. Anggrek No. 15, Bojongsoang, Bandung',
        lat_pickup: -6.9720,
        lng_pickup: 107.6250,
        jadwal_jemput: new Date(Date.now() + 3 * 60 * 60 * 1000), // +3 jam
        kurir_id: kasir2.id,
        ongkos_kirim: 8000,  // locked saat booking
        catatan_alamat: 'Rumah cat kuning, depan warung',
      }
    })
  }

  console.log('  ✓ 3 sample orders created\n')

  // ----------------------------------------
  // 10. SALDO LOG
  // ----------------------------------------
  console.log('💰 Seeding saldo log...')

  const existingLog = await prisma.saldoLog.findFirst({ where: { outlet_id: outlet.id } })
  if (!existingLog) {
    await prisma.saldoLog.createMany({
      data: [
        {
          outlet_id: outlet.id,
          tipe: 'kredit',
          jumlah: 70000,
          saldo_sebelum: 4141600,
          saldo_sesudah: 4211600,
          keterangan: 'Pembayaran order TRX-20250610-B7KP2M',
        },
        {
          outlet_id: outlet.id,
          tipe: 'kredit',
          jumlah: 38400,
          saldo_sebelum: 4211600,
          saldo_sesudah: 4250000,
          keterangan: 'Pembayaran order TRX-20250610-XXXXX',
        },
        {
          outlet_id: outlet.id,
          tipe: 'debit',
          jumlah: 500000,
          saldo_sebelum: 4750000,
          saldo_sesudah: 4250000,
          keterangan: 'Hold pencairan saldo',
        },
      ]
    })
  }

  console.log('  ✓ Saldo log created\n')

  // ----------------------------------------
  // SUMMARY
  // ----------------------------------------
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('✅ Seed berhasil!\n')
  console.log('📌 Akun untuk testing:')
  console.log('')
  console.log('  SUPERADMIN')
  console.log('  📱 08000000001 | 🔑 superadmin123')
  console.log('')
  console.log('  ADMIN OUTLET (Laundry Amanah)')
  console.log('  📱 08111111111 | 🔑 admin123')
  console.log('')
  console.log('  KASIR 1')
  console.log('  📱 08222222222 | 🔑 kasir123')
  console.log('')
  console.log('  KASIR 2 / KURIR')
  console.log('  📱 08333333333 | 🔑 kasir123')
  console.log('')
  console.log('  CUSTOMER 1 (Budi Santoso)')
  console.log('  📱 08123456789 | 🔑 customer123')
  console.log('')
  console.log('  CUSTOMER 2 (Sari Dewi)')
  console.log('  📱 08198765432 | 🔑 customer123')
  console.log('')
  console.log('  CUSTOMER 3 (Dian Nugraha)')
  console.log('  📱 08155551234 | 🔑 customer123')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main()
  .catch((e) => {
    console.error('❌ Seed gagal:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
