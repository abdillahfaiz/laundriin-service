import express from "express";
import helmet from "helmet";
import cors from "cors";
import hpp from "hpp";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";
import { winstonStream } from "./utils/logger";
import { errorHandler } from "./middlewares/error.middleware";
import { error } from "./utils/response.util";

// Import routes
import authRoutes from "./modules/auth/auth.routes";
import customerOutletRoutes from "./modules/customer/outlet/outlet.routes";
import customerOrderRoutes from "./modules/customer/order/order.routes";
import customerPaymentRoutes from "./modules/customer/payment/payment.routes";
import customerNotificationRoutes from "./modules/customer/notification/notification.routes";
import outletDashboardRoutes from "./modules/outlet/dashboard/dashboard.routes";
import outletOrderRoutes from "./modules/outlet/order/order.routes";
import outletLayananRoutes from "./modules/outlet/layanan/layanan.routes";
import outletKasirRoutes from "./modules/outlet/kasir/kasir.routes";
import outletProfileRoutes from "./modules/outlet/profile/profile.routes";
import outletSaldoRoutes from "./modules/outlet/saldo/saldo.routes";
import superadminRoutes from "./modules/superadmin/superadmin.routes";
import webhookRoutes from "./modules/webhook/webhook.routes";

const app = express();

// ============================================
// SECURITY MIDDLEWARE (order matters!)
// ============================================

// 1. Helmet
app.use(helmet());

// 2. CORS
app.use(cors({
  origin: env.ALLOWED_ORIGINS.split(",").map((o) => o.trim()),
  // origin: "*",
  credentials: true,
}));

// 3. HPP (HTTP Parameter Pollution protection)
app.use(hpp());

// 4. Body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// 5. Morgan HTTP logger
app.use(morgan("combined", { stream: winstonStream }));

// 6. Global rate limiter: max 100 req/15min per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Terlalu banyak request, coba lagi nanti" },
});
app.use("/api/", globalLimiter);

// 7. Auth rate limiter: max 10 req/15min per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Terlalu banyak percobaan login, coba lagi nanti" },
});
app.use("/api/v1/auth/login", authLimiter);
app.use("/api/v1/auth/register", authLimiter);

// ============================================
// ROUTES
// ============================================

// Health check
app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({ success: true, message: "Laundriin Service v2 is running 🚀", timestamp: new Date().toISOString() });
});

// Auth
app.use("/api/v1/auth", authRoutes);

// Customer
app.use("/api/v1/customer/outlets", customerOutletRoutes);
app.use("/api/v1/customer/orders", customerOrderRoutes);
app.use("/api/v1/customer/orders", customerPaymentRoutes);
app.use("/api/v1/customer/notifications", customerNotificationRoutes);

// Outlet / Kasir
app.use("/api/v1/outlet/dashboard", outletDashboardRoutes);
app.use("/api/v1/outlet/orders", outletOrderRoutes);
app.use("/api/v1/outlet/layanan", outletLayananRoutes);
app.use("/api/v1/outlet/kasir", outletKasirRoutes);
app.use("/api/v1/outlet", outletProfileRoutes);
app.use("/api/v1/outlet/saldo", outletSaldoRoutes);

// Superadmin
app.use("/api/v1/superadmin", superadminRoutes);

// Webhook
app.use("/api/v1/webhook", webhookRoutes);

// ============================================
// ERROR HANDLING
// ============================================

// 9. 404 handler
app.use((_req, res) => {
  res.status(404).json(error("Endpoint tidak ditemukan"));
});

// 10. Global error handler
app.use(errorHandler);

export default app;
