"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFcmToken = exports.refreshToken = exports.login = exports.registerOutlet = exports.registerCustomer = void 0;
const database_1 = __importDefault(require("../../config/database"));
const env_1 = require("../../config/env");
const error_middleware_1 = require("../../middlewares/error.middleware");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const SALT_ROUNDS = 12;
const generateTokens = (userId, role, outletId) => {
    const accessToken = jsonwebtoken_1.default.sign({ userId, role, outletId }, env_1.env.JWT_SECRET, { expiresIn: env_1.env.JWT_EXPIRES_IN });
    const refreshToken = jsonwebtoken_1.default.sign({ userId, role, outletId }, env_1.env.JWT_REFRESH_SECRET, { expiresIn: env_1.env.JWT_REFRESH_EXPIRES_IN });
    return { accessToken, refreshToken };
};
const registerCustomer = async (input) => {
    const existingUser = await database_1.default.user.findUnique({
        where: { nomor_telepon: input.nomor_telepon },
    });
    if (existingUser) {
        throw new error_middleware_1.AppError(409, "Nomor telepon sudah terdaftar");
    }
    const hashedPassword = await bcryptjs_1.default.hash(input.password, SALT_ROUNDS);
    const user = await database_1.default.user.create({
        data: {
            nama: input.nama,
            nomor_telepon: input.nomor_telepon,
            password: hashedPassword,
            role: "customer",
        },
        select: {
            id: true,
            nama: true,
            nomor_telepon: true,
            role: true,
            created_at: true,
        },
    });
    const tokens = generateTokens(user.id, user.role, null);
    return { user, ...tokens };
};
exports.registerCustomer = registerCustomer;
const registerOutlet = async (input) => {
    const existingUser = await database_1.default.user.findUnique({
        where: { nomor_telepon: input.nomor_telepon },
    });
    if (existingUser) {
        throw new error_middleware_1.AppError(409, "Nomor telepon sudah terdaftar");
    }
    const hashedPassword = await bcryptjs_1.default.hash(input.password, SALT_ROUNDS);
    const result = await database_1.default.$transaction(async (tx) => {
        // Create admin user
        const user = await tx.user.create({
            data: {
                nama: input.nama_pemilik,
                nomor_telepon: input.nomor_telepon,
                password: hashedPassword,
                role: "admin_outlet",
            },
        });
        // Create outlet
        const outlet = await tx.outlet.create({
            data: {
                admin_id: user.id,
                nama_outlet: input.nama_outlet,
                alamat: input.alamat,
                foto_outlet: input.foto_outlet || null,
                lat: input.lat,
                lng: input.lng,
            },
        });
        // Create default operational hours (7 days)
        const days = ["senin", "selasa", "rabu", "kamis", "jumat", "sabtu", "minggu"];
        await tx.outletOperasional.createMany({
            data: days.map((hari) => ({
                outlet_id: outlet.id,
                hari,
                jam_buka: "08:00",
                jam_tutup: "21:00",
                is_open: hari !== "minggu",
            })),
        });
        return {
            user: {
                id: user.id,
                nama: user.nama,
                nomor_telepon: user.nomor_telepon,
                role: user.role,
            },
            outlet: {
                id: outlet.id,
                nama_outlet: outlet.nama_outlet,
                status: outlet.status,
            },
        };
    });
    const tokens = generateTokens(result.user.id, result.user.role, result.outlet.id);
    return { ...result, ...tokens };
};
exports.registerOutlet = registerOutlet;
const login = async (input) => {
    const user = await database_1.default.user.findUnique({
        where: { nomor_telepon: input.nomor_telepon },
        include: {
            outlet_admin: { select: { id: true } },
            outlet_kasir: {
                where: { is_active: true },
                select: { outlet_id: true },
            },
        },
    });
    if (!user) {
        throw new error_middleware_1.AppError(401, "Nomor telepon atau password salah");
    }
    if (!user.is_active) {
        throw new error_middleware_1.AppError(403, "Akun Anda telah dinonaktifkan");
    }
    const isPasswordValid = await bcryptjs_1.default.compare(input.password, user.password);
    if (!isPasswordValid) {
        throw new error_middleware_1.AppError(401, "Nomor telepon atau password salah");
    }
    // Determine outletId based on role
    let outletId = null;
    if (user.role === "admin_outlet" && user.outlet_admin) {
        outletId = user.outlet_admin.id;
    }
    else if (user.role === "kasir" && user.outlet_kasir.length > 0) {
        outletId = user.outlet_kasir[0].outlet_id;
    }
    const tokens = generateTokens(user.id, user.role, outletId);
    return {
        user: {
            id: user.id,
            nama: user.nama,
            nomor_telepon: user.nomor_telepon,
            role: user.role,
            outletId,
        },
        ...tokens,
    };
};
exports.login = login;
const refreshToken = async (token) => {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_REFRESH_SECRET);
        const user = await database_1.default.user.findUnique({
            where: { id: decoded.userId },
        });
        if (!user || !user.is_active) {
            throw new error_middleware_1.AppError(401, "Token tidak valid");
        }
        const tokens = generateTokens(decoded.userId, decoded.role, decoded.outletId);
        return tokens;
    }
    catch (err) {
        throw new error_middleware_1.AppError(401, "Refresh token tidak valid atau expired");
    }
};
exports.refreshToken = refreshToken;
const updateFcmToken = async (userId, fcmToken) => {
    await database_1.default.user.update({
        where: { id: userId },
        data: { fcm_token: fcmToken },
    });
};
exports.updateFcmToken = updateFcmToken;
//# sourceMappingURL=auth.service.js.map