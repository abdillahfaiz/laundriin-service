import QRCode from "qrcode";

/**
 * Generate QR code as base64 PNG data URL
 * @param transactionId - The transaction ID to encode
 * @returns base64 data URL string
 */
export const generateQR = async (transactionId: string): Promise<string> => {
  const qrDataUrl = await QRCode.toDataURL(transactionId, {
    errorCorrectionLevel: "M",
    width: 300,
    margin: 2,
  });
  return qrDataUrl;
};
