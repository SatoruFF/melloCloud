import dotenv from 'dotenv';

dotenv.config();

// import { S3 } from "@aws-sdk/client-s3";
import { PrismaClient } from '@prisma/client';
import AWS from 'aws-sdk';
// services
import ImageKit from 'imagekit';

export const FETCH_LIMIT = process.env.FETCH_LIMIT || 10000;

export const PORT = Number(process.env.PORT || 3002);
export const PORT_HTTP = process.env.PORT_HTTP ?? '80';
export const PORT_HTTPS = process.env.PORT_HTTPS ?? '443';
export const HTTPS = process.env.HTTPS === 'true';
export const HTTPS_FORCE = process.env.HTTPS_FORCE === 'true';
export const HTTPS_CERTIFICATE_PATH = process.env.HTTPS_CERTIFICATE_PATH ?? '';
export const HTTPS_KEY_PATH = process.env.HTTPS_KEY_PATH ?? '';
export const ROOT_DIR = process.env.ROOT_DIR ?? process.cwd();

interface ImageKitConfig {
  publicKey: string;
  privateKey: string;
  urlEndpoint: string;
}

// assets upload
export const imagekit = new ImageKit({
  publicKey: process.env.IK_PUBLIC_KEY,
  privateKey: process.env.IK_PRIVATE_KEY,
  urlEndpoint: process.env.IK_URL_ENDPOINT,
} as ImageKitConfig);

// s3
// JS SDK v3 does not support global configuration.
// Codemod has attempted to pass values to each service client in this file.
// You may need to update clients outside of this file, if they use global config.
AWS.config.update({
  region: process.env.S3_REGION,
  accessKeyId: process.env.YK_IDENTIFIER,
  secretAccessKey: process.env.YK_SECRET,
});

export const s3: any = new AWS.S3({
  endpoint: 'https://storage.yandexcloud.net',
});

// prisma init
export const prisma = new PrismaClient({
  log: ['query', 'info', 'error'],
  errorFormat: 'pretty',
  transactionOptions: {
    maxWait: 10000, // default: 2000
    timeout: 20000, // default: 5000
  },
});
