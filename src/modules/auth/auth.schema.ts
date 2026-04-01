import { z } from "zod/v4";

export const registerCustomerSchema = z.object({
  nama: z.string().min(2).max(100),
  nomor_telepon: z.string().regex(/^08[0-9]{8,20}$/, "Format nomor tidak valid"),
  password: z.string().min(8).max(100),
});

export const registerOutletSchema = z.object({
  nama_outlet: z.string().min(2).max(150),
  alamat: z.string().min(5),
  foto_outlet: z.string().optional(),
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  nama_pemilik: z.string().min(2).max(100),
  nomor_telepon: z.string().regex(/^08[0-9]{8,20}$/, "Format nomor tidak valid"),
  password: z.string().min(8).max(100),
});

export const loginSchema = z.object({
  nomor_telepon: z.string().regex(/^08[0-9]{8,20}$/, "Format nomor tidak valid"),
  password: z.string().min(1),
});

export const refreshTokenSchema = z.object({
  refresh_token: z.string().min(1),
});

export const fcmTokenSchema = z.object({
  fcm_token: z.string().min(1),
});
