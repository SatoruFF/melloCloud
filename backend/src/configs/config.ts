import dotenv from 'dotenv';

dotenv.config();

// import { S3 } from "@aws-sdk/client-s3";
import { PrismaClient } from '@prisma/client';
import AWS from 'aws-sdk';
// services
import ImageKit from 'imagekit';

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------
export const NODE_ENV = process.env.NODE_ENV ?? 'development';
export const isProduction = NODE_ENV === 'production';

export const FETCH_LIMIT = Number(process.env.FETCH_LIMIT) || 10000;
export const PORT = Number(process.env.PORT) || 3002;
export const PORT_HTTP = process.env.PORT_HTTP ?? '80';
export const PORT_HTTPS = process.env.PORT_HTTPS ?? '443';
export const HTTPS = process.env.HTTPS === 'true';
export const HTTPS_FORCE = process.env.HTTPS_FORCE === 'true';
export const HTTPS_CERTIFICATE_PATH = process.env.HTTPS_CERTIFICATE_PATH ?? '';
export const HTTPS_KEY_PATH = process.env.HTTPS_KEY_PATH ?? '';
export const ROOT_DIR = process.env.ROOT_DIR ?? process.cwd();
export const WORKERS_COUNT = Number(process.env.WORKERS_COUNT) || 0;

// ---------------------------------------------------------------------------
// URLs
// ---------------------------------------------------------------------------
export const API_URL = process.env.API_URL ?? 'http://localhost:3002';
export const CLIENT_URL = process.env.CLIENT_URL ?? 'http://localhost:5173';
export const FRONTEND_URL = process.env.FRONTEND_URL ?? process.env.CLIENT_URL ?? 'http://localhost:5173';

// ---------------------------------------------------------------------------
// Auth / JWT
// ---------------------------------------------------------------------------
export const ACCESS_SECRET_KEY = process.env.ACCESS_SECRET_KEY ?? '';
export const REFRESH_SECRET_KEY = process.env.REFRESH_SECRET_KEY ?? '';

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------
/** ID пользователей с доступом в админку (через запятую в .env). Только они могут заходить в /admin. */
export function getAdminUserIds(): number[] {
  const raw = process.env.ADMIN_USER_IDS ?? '';
  if (!raw.trim()) return [];
  return raw
    .split(',')
    .map((s) => Number.parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n) && n > 0);
}

// ---------------------------------------------------------------------------
// S3 / Yandex Cloud
// ---------------------------------------------------------------------------
export const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME ?? '';
export const S3_REGION = process.env.S3_REGION ?? '';
export const YK_IDENTIFIER = process.env.YK_IDENTIFIER ?? '';
export const YK_SECRET = process.env.YK_SECRET ?? '';

// ---------------------------------------------------------------------------
// ImageKit
// ---------------------------------------------------------------------------
interface ImageKitConfig {
  publicKey: string;
  privateKey: string;
  urlEndpoint: string;
}

export const imagekit = new ImageKit({
  publicKey: process.env.IK_PUBLIC_KEY ?? '',
  privateKey: process.env.IK_PRIVATE_KEY ?? '',
  urlEndpoint: process.env.IK_URL_ENDPOINT ?? '',
} as ImageKitConfig);

// ---------------------------------------------------------------------------
// AWS SDK (Yandex S3)
// ---------------------------------------------------------------------------
AWS.config.update({
  region: S3_REGION,
  accessKeyId: YK_IDENTIFIER,
  secretAccessKey: YK_SECRET,
});

export const s3: any = new AWS.S3({
  endpoint: 'https://storage.yandexcloud.net',
});

// ---------------------------------------------------------------------------
// Prisma
// ---------------------------------------------------------------------------
const PRISMA_LOGS = process.env.PRISMA_LOGS === 'true';
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: PRISMA_LOGS ? ['query', 'info', 'error'] : [],
    errorFormat: 'pretty',
    transactionOptions: {
      maxWait: 10000,
      timeout: 20000,
    },
  });

if (!isProduction) {
  globalForPrisma.prisma = prisma;
}

// ---------------------------------------------------------------------------
// Mail
// ---------------------------------------------------------------------------
export const SMTP_HOST = process.env.SMTP_HOST ?? '';
export const SMTP_PORT = Number(process.env.SMTP_PORT) || 587;
export const SMTP_USER = process.env.SMTP_USER ?? '';
export const SMTP_PASSWORD = process.env.SMTP_PASSWORD ?? '';
export const SERVICE_NAME = process.env.SEVICE_NAME ?? 'mello';

// ---------------------------------------------------------------------------
// OAuth / Telegram
// ---------------------------------------------------------------------------
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? '';
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ?? '';
export const YANDEX_CLIENT_ID = process.env.YANDEX_CLIENT_ID ?? '';
export const YANDEX_CLIENT_SECRET = process.env.YANDEX_CLIENT_SECRET ?? '';
export const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? '';

// ---------------------------------------------------------------------------
// Other
// ---------------------------------------------------------------------------
export const MESSAGE_ENCRYPTION_KEY = process.env.MESSAGE_ENCRYPTION_KEY ?? '';
