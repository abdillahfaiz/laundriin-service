# TECHNICAL SPEC - Laundry Drop and Go Backend
Dokumen ini berisi konvensi teknis yang WAJIB diikuti agent saat generate code.

---

## 1. TECH STACK

- Runtime      : Node.js 20+
- Language     : TypeScript (strict mode)
- Framework    : Express.js
- ORM          : Prisma + PostgreSQL
- Auth         : JWT (jsonwebtoken + bcryptjs)
- Validation   : Zod
- File Upload  : Multer + Cloudinary
- Payment      : Midtrans Core API via axios (BUKAN SDK)
- Push Notif   : Firebase Admin SDK (FCM)
- QR Code      : qrcode package
- Logger       : Winston
- HTTP Logger  : Morgan

---

## 2. FOLDER STRUCTURE

src/
  config/
    database.ts       -> Prisma client singleton
    firebase.ts       -> Firebase Admin init
    cloudinary.ts     -> Cloudinary v2 config
    env.ts            -> Zod env validation + export typed env
  middlewares/
    auth.middleware.ts    -> verifyToken, requireRole(roles[])
    validate.middleware.ts -> validateBody(schema), validateQuery(schema)
    upload.middleware.ts   -> multer config (memory storage, max 5MB, image only)
    error.middleware.ts    -> global error handler
  modules/
    auth/
      auth.controller.ts
      auth.service.ts
      auth.routes.ts
      auth.schema.ts    -> Zod schemas
    customer/
      outlet/
        outlet.controller.ts
        outlet.service.ts
        outlet.routes.ts
        outlet.schema.ts
      order/
        order.controller.ts
        order.service.ts
        order.routes.ts
        order.schema.ts
      payment/
        payment.controller.ts
        payment.service.ts
        payment.routes.ts
        payment.schema.ts
      notification/
        notification.controller.ts
        notification.service.ts
        notification.routes.ts
    outlet/
      dashboard/
      order/
      layanan/
      kasir/
      saldo/
      profile/
    superadmin/
      outlet/
      pencairan/
      user/
    webhook/
      webhook.controller.ts
      webhook.service.ts
      webhook.routes.ts
  utils/
    response.util.ts      -> success(), paginated(), error() helper
    qrcode.util.ts        -> generateQR(transactionId): Promise<string>
    haversine.util.ts     -> haversine(lat1, lng1, lat2, lng2): number (km)
    notification.util.ts  -> sendPushNotif(fcmToken, title, body, data)
    upload.util.ts        -> uploadToCloudinary(buffer, folder): Promise<string>
    midtrans.util.ts      -> createPayment(), checkStatus()
    logger.ts             -> Winston instance
  app.ts                  -> Express setup + middleware + routes
  server.ts               -> HTTP server start

prisma/
  schema.prisma
  migrations/

.env
.env.example
package.json
tsconfig.json

---

## 3. NAMING CONVENTIONS

- File       : kebab-case (auth.service.ts, order.controller.ts)
- Variable   : camelCase (outletId, totalHarga)
- Function   : camelCase (createOrder, getOutletById)
- Class      : PascalCase (AuthService, OrderController)
- Env var    : SCREAMING_SNAKE_CASE (JWT_SECRET, MIDTRANS_SERVER_KEY)
- DB column  : snake_case (sesuai Prisma schema)
- Route      : kebab-case (/customer/orders, /outlet/layanan/jenis)

---

## 4. RESPONSE FORMAT

Semua response menggunakan helper dari response.util.ts.

Success (200/201):
{
  "success": true,
  "message": "string",
  "data": object | array | null
}

Paginated (200):
{
  "success": true,
  "message": "string",
  "data": array,
  "pagination": {
    "page": number,
    "limit": number,
    "total": number,
    "total_pages": number
  }
}

Error (400/401/403/404/409/500):
{
  "success": false,
  "message": "string",
  "errors": array | null
}

Helper usage:
  return res.status(200).json(success("Berhasil", data))
  return res.status(201).json(success("Berhasil dibuat", data))
  return res.status(400).json(error("Validasi gagal", zodErrors))
  return res.status(404).json(error("Data tidak ditemukan"))

---

## 5. ERROR HANDLING

Pattern: try/catch di semua async controller, lempar ke global error handler.

Controller pattern:
  export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await orderService.createOrder(req.body, req.user)
      return res.status(201).json(success("Order berhasil dibuat", data))
    } catch (err) {
      next(err)
    }
  }

Custom error class di error.middleware.ts:
  class AppError extends Error {
    constructor(public statusCode: number, message: string) {
      super(message)
    }
  }

Global error handler (app.ts terakhir):
  app.use((err, req, res, next) => {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json(error(err.message))
    }
    logger.error(err)
    return res.status(500).json(error("Internal server error"))
  })

---

## 6. AUTH MIDDLEWARE

verifyToken middleware:
  - Extract Bearer token dari header Authorization
  - Verify dengan jwt.verify(token, JWT_SECRET)
  - Attach decoded payload ke req.user
  - Throw 401 jika token invalid atau expired

requireRole middleware:
  - Terima array of roles: requireRole(["admin_outlet", "kasir"])
  - Throw 403 jika req.user.role tidak ada di array

req.user type:
  {
    userId: string
    role: Role
    outletId: string | null
  }

---

## 7. VALIDATION MIDDLEWARE

Gunakan Zod untuk semua validasi request.

validateBody(schema):
  - Parse req.body dengan schema.safeParse()
  - Jika gagal: return 400 dengan list errors dari Zod
  - Jika sukses: assign req.body = result.data (parsed + typed)

validateQuery(schema):
  - Sama tapi untuk req.query

Contoh schema (auth.schema.ts):
  export const registerCustomerSchema = z.object({
    nama: z.string().min(2).max(100),
    nomor_telepon: z.string().regex(/^08[0-9]{8,11}$/, "Format nomor tidak valid"),
    password: z.string().min(8).max(100)
  })

---

## 8. PRISMA USAGE

Gunakan singleton pattern di config/database.ts:
  import { PrismaClient } from "@prisma/client"
  const prisma = new PrismaClient()
  export default prisma

Import di service:
  import prisma from "../../config/database"

Gunakan transaction untuk operasi yang mengubah multiple tabel:
  await prisma.$transaction([
    prisma.order.update(...),
    prisma.outlet.update(...),
    prisma.saldoLog.create(...)
  ])

---

## 9. FILE UPLOAD

Alur upload file:
  1. Multer terima file ke memory (buffer)
  2. Upload buffer ke Cloudinary via uploadToCloudinary()
  3. Simpan URL Cloudinary ke DB

uploadToCloudinary(buffer: Buffer, folder: string): Promise<string>
  - Gunakan upload_stream dari cloudinary v2
  - Return secure_url

Folder naming di Cloudinary:
  - laundry/outlets       -> foto outlet
  - laundry/timbangan     -> foto timbangan
  - laundry/bukti_transfer -> bukti transfer pencairan

---

## 10. MIDTRANS UTIL

File: utils/midtrans.util.ts

Functions:
  createMidtransPayment(orderId: string, amount: number, metode: string): Promise<MidtransResponse>
  checkMidtransStatus(midtransOrderId: string): Promise<MidtransStatusResponse>
  verifyMidtransSignature(orderId: string, statusCode: string, grossAmount: string): string

Authorization: "Basic " + Buffer.from(process.env.MIDTRANS_SERVER_KEY + ":").toString("base64")

---

## 11. HAVERSINE UTIL

File: utils/haversine.util.ts

haversine(lat1: number, lng1: number, lat2: number, lng2: number): number
  - Return jarak dalam kilometer (float, 2 desimal)
  - Formula Haversine standard

---

## 12. SECURITY CONFIG (app.ts)

Urutan middleware di app.ts:
  1. helmet()
  2. cors({ origin: ALLOWED_ORIGINS })
  3. hpp()
  4. express.json({ limit: "10mb" })
  5. morgan("combined", { stream: winstonStream })
  6. Rate limiter global: max 100 req/15 menit per IP
  7. Rate limiter auth: max 10 req/15 menit per IP (khusus /auth/login dan /auth/register)
  8. Routes
  9. 404 handler
  10. Global error handler

---

## 13. ENVIRONMENT VARIABLES

# Server
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/laundry_db

# JWT
JWT_SECRET=min_32_karakter
JWT_REFRESH_SECRET=min_32_karakter
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Midtrans
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxx
MIDTRANS_IS_PRODUCTION=false

# Cloudinary
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx

# Firebase FCM
FIREBASE_PROJECT_ID=xxx
FIREBASE_PRIVATE_KEY=xxx
FIREBASE_CLIENT_EMAIL=xxx

# CORS
ALLOWED_ORIGINS=http://localhost:3000

---

## 14. PACKAGES YANG DIGUNAKAN

Dependencies:
  express, prisma, @prisma/client, jsonwebtoken, bcryptjs,
  helmet, cors, express-rate-limit, express-slow-down, hpp,
  zod, multer, cloudinary, firebase-admin,
  qrcode, dayjs, axios, morgan, winston, dotenv, uuid

Dev Dependencies:
  typescript, ts-node, nodemon,
  @types/express, @types/node, @types/jsonwebtoken,
  @types/bcryptjs, @types/multer, @types/morgan,
  @types/cors, @types/hpp, @types/uuid, @types/qrcode

TIDAK MENGGUNAKAN: midtrans-client, snap SDK
