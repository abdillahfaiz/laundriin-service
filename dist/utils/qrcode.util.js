"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateQR = void 0;
const qrcode_1 = __importDefault(require("qrcode"));
/**
 * Generate QR code as base64 PNG data URL
 * @param transactionId - The transaction ID to encode
 * @returns base64 data URL string
 */
const generateQR = async (transactionId) => {
    const qrDataUrl = await qrcode_1.default.toDataURL(transactionId, {
        errorCorrectionLevel: "M",
        width: 300,
        margin: 2,
    });
    return qrDataUrl;
};
exports.generateQR = generateQR;
//# sourceMappingURL=qrcode.util.js.map