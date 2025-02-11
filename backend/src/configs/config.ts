import "dotenv/config";

// services
import ImageKit from "imagekit";
import AWS from "aws-sdk";
// import { S3 } from "@aws-sdk/client-s3";
import { Prisma, PrismaClient } from "@prisma/client";

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
  endpoint: "https://storage.yandexcloud.net",
});

// prisma init
export const prisma = new PrismaClient({
  log: ["query", "info", "error"],
  errorFormat: "pretty",
  transactionOptions: {
    maxWait: 10000, // default: 2000
    timeout: 20000, // default: 5000
  },
});
