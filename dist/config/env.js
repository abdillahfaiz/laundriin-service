"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const v4_1 = require("zod/v4");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const envSchema = v4_1.z.object({
    NODE_ENV: v4_1.z.enum(["development", "production", "test"]).default("development"),
    PORT: v4_1.z.coerce.number().default(3000),
    DATABASE_URL: v4_1.z.string(),
    JWT_SECRET: v4_1.z.string().min(32),
    JWT_REFRESH_SECRET: v4_1.z.string().min(32),
    JWT_EXPIRES_IN: v4_1.z.string().default("15m"),
    JWT_REFRESH_EXPIRES_IN: v4_1.z.string().default("7d"),
    MIDTRANS_SERVER_KEY: v4_1.z.string(),
    MIDTRANS_IS_PRODUCTION: v4_1.z.coerce.boolean().default(false),
    CLOUDINARY_CLOUD_NAME: v4_1.z.string().optional(),
    CLOUDINARY_API_KEY: v4_1.z.string().optional(),
    CLOUDINARY_API_SECRET: v4_1.z.string().optional(),
    FIREBASE_PROJECT_ID: v4_1.z.string().optional(),
    FIREBASE_PRIVATE_KEY: v4_1.z.string().optional(),
    FIREBASE_CLIENT_EMAIL: v4_1.z.string().optional(),
    ALLOWED_ORIGINS: v4_1.z.string().default("http://localhost:3000"),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error("❌ Invalid environment variables:", parsed.error.format());
    process.exit(1);
}
exports.env = parsed.data;
//# sourceMappingURL=env.js.map