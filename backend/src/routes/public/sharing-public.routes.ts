import { Hono } from "hono";
import createError from "http-errors";
import { logger } from "../../configs/logger.js";
import { SharingService } from "../../services/sharingService.js";

const sharingRouter = new Hono();

// Access public resource (no auth required)
sharingRouter.get("/public/:token", async (c) => {
  try {
    const token = c.req.param("token");
    if (!token) {
      throw createError(400, "Token is required");
    }
    const resource = await SharingService.accessPublicResource(token);
    return c.json(resource);
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    logger.error(err.message ?? String(error), error);
    return c.json({ message: err.message ?? "Error" }, err.statusCode ?? 500);
  }
});

// Access public resource (no auth required)
sharingRouter.get("/:token", async (c) => {
  try {
    const token = c.req.param("token");
    if (!token) {
      throw createError(400, "Token is required");
    }
    const resource = await SharingService.accessPublicResource(token);
    return c.json(resource);
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    logger.error(err.message ?? String(error), error);
    return c.json({ message: err.message ?? "Error" }, err.statusCode ?? 500);
  }
});

// Download public file (no auth required)
sharingRouter.get("/:token/download", async (c) => {
  try {
    const token = c.req.param("token");
    if (!token) {
      throw createError(400, "Token is required");
    }
    const { file, s3object } = await SharingService.downloadPublicFile(token);
    const body = s3object.Body as Buffer | Uint8Array | undefined;
    return c.newResponse(body ?? new Uint8Array(0), {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="${file.name}"`,
        "Content-Type": file.type || "application/octet-stream",
        "Content-Length": String(s3object.ContentLength ?? 0),
      },
    });
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    logger.error(err.message ?? String(error), error);
    return c.json({ message: err.message ?? "Error" }, err.statusCode ?? 500);
  }
});

export default sharingRouter;
