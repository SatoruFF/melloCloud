import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { compress } from "hono/compress";
import { rateLimiter } from "./configs/rateLimiter";
import v1Router from "./routes/index";
import { logger as customLogger } from "./configs/logger";
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
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
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
app.use(
  "*",
  cors({
    origin: "*", // В проде укажи конкретные домены!
    allowMethods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    credentials: true,
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

// Health check
app.get("/", (c) => {
  return c.text("i am alive ;)");
});

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
