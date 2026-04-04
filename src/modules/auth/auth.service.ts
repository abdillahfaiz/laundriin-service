import prisma from "../../config/database";
import { env } from "../../config/env";
import { AppError } from "../../middlewares/error.middleware";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Role, HariEnum } from "@prisma/client";
import type { StringValue } from "ms";

const SALT_ROUNDS = 12;

interface RegisterCustomerInput {
  nama: string;
  nomor_telepon: string;
  password: string;
}

interface RegisterOutletInput {
  nama_outlet: string;
  alamat: string;
  foto_outlet?: string;
  lat: number;
  lng: number;
  nama_pemilik: string;
  nomor_telepon: string;
  password: string;
}

interface LoginInput {
  nomor_telepon: string;
  password: string;
}

const generateTokens = (userId: string, role: Role, outletId: string | null) => {
  const accessToken = jwt.sign(
    { userId, role, outletId },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN as StringValue }
  );

  const refreshToken = jwt.sign(
    { userId, role, outletId },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN as StringValue }
  );

  return { accessToken, refreshToken };
};

export const registerCustomer = async (input: RegisterCustomerInput) => {
  const existingUser = await prisma.user.findUnique({
    where: { nomor_telepon: input.nomor_telepon },
  });

  if (existingUser) {
    throw new AppError(409, "Nomor telepon sudah terdaftar");
  }

  const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);

  const user = await prisma.user.create({
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

export const registerOutlet = async (input: RegisterOutletInput) => {
  const existingUser = await prisma.user.findUnique({
    where: { nomor_telepon: input.nomor_telepon },
  });

  if (existingUser) {
    throw new AppError(409, "Nomor telepon sudah terdaftar");
  }

  const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);

  const result = await prisma.$transaction(async (tx) => {
    // Create admin user
    const user = await tx.user.create({
      data: {
        nama: input.nama_pemilik,
        nomor_telepon: input.nomor_telepon,
        password: hashedPassword,
        role: "admin_outlet",
      },
    });

    // Create outlet (langsung aktif tanpa perlu approval)
    const outlet = await tx.outlet.create({
      data: {
        admin_id: user.id,
        nama_outlet: input.nama_outlet,
        alamat: input.alamat,
        foto_outlet: input.foto_outlet || null,
        lat: input.lat,
        lng: input.lng,
        status: "aktif",
      },
    });

    // Create default operational hours (7 days)
    const days: HariEnum[] = ["senin", "selasa", "rabu", "kamis", "jumat", "sabtu", "minggu"];
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

  const tokens = generateTokens(result.user.id, result.user.role as Role, result.outlet.id);

  return { ...result, ...tokens };
};

export const login = async (input: LoginInput) => {
  const user = await prisma.user.findUnique({
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
    throw new AppError(401, "Nomor telepon atau password salah");
  }

  if (!user.is_active) {
    throw new AppError(403, "Akun Anda telah dinonaktifkan");
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.password);
  if (!isPasswordValid) {
    throw new AppError(401, "Nomor telepon atau password salah");
  }

  // Determine outletId based on role
  let outletId: string | null = null;
  if (user.role === "admin_outlet" && user.outlet_admin) {
    outletId = user.outlet_admin.id;
  } else if (user.role === "kasir" && user.outlet_kasir.length > 0) {
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

export const refreshToken = async (token: string) => {
  try {
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as {
      userId: string;
      role: Role;
      outletId: string | null;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || !user.is_active) {
      throw new AppError(401, "Token tidak valid");
    }

    const tokens = generateTokens(decoded.userId, decoded.role, decoded.outletId);
    return tokens;
  } catch (err) {
    throw new AppError(401, "Refresh token tidak valid atau expired");
  }
};

export const updateFcmToken = async (userId: string, fcmToken: string) => {
  await prisma.user.update({
    where: { id: userId },
    data: { fcm_token: fcmToken },
  });
};
