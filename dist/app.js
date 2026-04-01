"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const hpp_1 = __importDefault(require("hpp"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const env_1 = require("./config/env");
const logger_1 = require("./utils/logger");
const error_middleware_1 = require("./middlewares/error.middleware");
const response_util_1 = require("./utils/response.util");
// Import routes
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const outlet_routes_1 = __importDefault(require("./modules/customer/outlet/outlet.routes"));
const order_routes_1 = __importDefault(require("./modules/customer/order/order.routes"));
const payment_routes_1 = __importDefault(require("./modules/customer/payment/payment.routes"));
const notification_routes_1 = __importDefault(require("./modules/customer/notification/notification.routes"));
const dashboard_routes_1 = __importDefault(require("./modules/outlet/dashboard/dashboard.routes"));
const order_routes_2 = __importDefault(require("./modules/outlet/order/order.routes"));
const layanan_routes_1 = __importDefault(require("./modules/outlet/layanan/layanan.routes"));
const kasir_routes_1 = __importDefault(require("./modules/outlet/kasir/kasir.routes"));
const profile_routes_1 = __importDefault(require("./modules/outlet/profile/profile.routes"));
const saldo_routes_1 = __importDefault(require("./modules/outlet/saldo/saldo.routes"));
const superadmin_routes_1 = __importDefault(require("./modules/superadmin/superadmin.routes"));
const webhook_routes_1 = __importDefault(require("./modules/webhook/webhook.routes"));
const app = (0, express_1.default)();
// ============================================
// SECURITY MIDDLEWARE (order matters!)
// ============================================
// 1. Helmet
app.use((0, helmet_1.default)());
// 2. CORS
app.use((0, cors_1.default)({
    origin: env_1.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim()),
    // origin: "*",
    credentials: true,
}));
// 3. HPP (HTTP Parameter Pollution protection)
app.use((0, hpp_1.default)());
// 4. Body parser
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
// 5. Morgan HTTP logger
app.use((0, morgan_1.default)("combined", { stream: logger_1.winstonStream }));
// 6. Global rate limiter: max 100 req/15min per IP
const globalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Terlalu banyak request, coba lagi nanti" },
});
app.use("/api/", globalLimiter);
// 7. Auth rate limiter: max 10 req/15min per IP
const authLimiter = (0, express_rate_limit_1.default)({
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
app.use("/api/v1/auth", auth_routes_1.default);
// Customer
app.use("/api/v1/customer/outlets", outlet_routes_1.default);
app.use("/api/v1/customer/orders", order_routes_1.default);
app.use("/api/v1/customer/orders", payment_routes_1.default);
app.use("/api/v1/customer/notifications", notification_routes_1.default);
// Outlet / Kasir
app.use("/api/v1/outlet/dashboard", dashboard_routes_1.default);
app.use("/api/v1/outlet/orders", order_routes_2.default);
app.use("/api/v1/outlet/layanan", layanan_routes_1.default);
app.use("/api/v1/outlet/kasir", kasir_routes_1.default);
app.use("/api/v1/outlet", profile_routes_1.default);
app.use("/api/v1/outlet/saldo", saldo_routes_1.default);
// Superadmin
app.use("/api/v1/superadmin", superadmin_routes_1.default);
// Webhook
app.use("/api/v1/webhook", webhook_routes_1.default);
// ============================================
// ERROR HANDLING
// ============================================
// 9. 404 handler
app.use((_req, res) => {
    res.status(404).json((0, response_util_1.error)("Endpoint tidak ditemukan"));
});
// 10. Global error handler
app.use(error_middleware_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map