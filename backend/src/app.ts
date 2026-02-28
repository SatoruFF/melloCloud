import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { compress } from "hono/compress";
import { swaggerUI } from "@hono/swagger-ui";
import { rateLimiter } from "./configs/rateLimiter.js";
import v1Router from "./routes/index.js";
import { openApiDoc } from "./openapi.js";
import { logger as customLogger } from "./configs/logger.js";
import "dotenv/config";

const app = new Hono();

// ========================================
// SECURITY MIDDLEWARE (аналог Helmet)
// ========================================
app.use(
  "*",
  secureHeaders({
    contentSecurityPolicy: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https:"],
    },
    xFrameOptions: "DENY",
    strictTransportSecurity: "max-age=31536000; includeSubDomains",
    xContentTypeOptions: "nosniff",
    referrerPolicy: "strict-origin-when-cross-origin",
  }),
);

// ========================================
// MIDDLEWARE
// ========================================
// CORS: разрешаем CLIENT_URL / FRONTEND_URL + localhost в dev
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const FRONTEND_URL = process.env.FRONTEND_URL || CLIENT_URL;
const isDevelopment = process.env.NODE_ENV !== "production";

const allowedOrigins = new Set(
  [CLIENT_URL, FRONTEND_URL].filter(Boolean),
);

app.use(
  "*",
  cors({
    origin: (origin: string): string | undefined => {
      if (!origin) return undefined;
      if (isDevelopment && origin.includes("localhost")) return origin;
      return allowedOrigins.has(origin) ? origin : undefined;
    },
    allowMethods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    credentials: true,
    maxAge: 86400, // 24 hours
  }),
);

app.use("*", logger()); // Hono встроенный logger
// Сжатие только если доступен CompressionStream (Node 18.3+, Bun, браузер)
if (typeof globalThis.CompressionStream !== "undefined") {
  app.use("*", compress());
}

// Rate limiter (кастомный, см. ниже)
app.use("*", rateLimiter);

// ========================================
// ROUTES
// ========================================
app.route("/api/v1", v1Router);
app.route("/v1", v1Router);

// Health check — возвращает статус и версию сборки
app.get("/", (c) => {
  return c.json({
    status: "alive",
    version: process.env.BUILD_VERSION || "unknown",
    buildSha: process.env.BUILD_SHA || "unknown",
    buildDate: process.env.BUILD_DATE || "unknown",
  });
});

// OpenAPI spec (JSON) and Swagger UI for all API routes
app.get("/api-docs/openapi.json", (c) => c.json(openApiDoc));
app.get("/api-docs", swaggerUI({ url: "/api-docs/openapi.json" }));

// ========================================
// ERROR HANDLER
// ========================================
app.onError((err, c) => {
  customLogger.error(err.message);
  return c.json({ error: err.message }, 500);
});

// 404 Handler
app.notFound((c) => {
  return c.json({ error: "Not Found" }, 404);
});

export default app;
