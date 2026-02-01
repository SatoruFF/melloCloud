import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { prisma } from "../../configs/config.js";
import { adminMiddleware } from "../../middleware/admin.middleware.js";

const adminRouter = new Hono();

adminRouter.use("*", adminMiddleware);

const paginationSchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
});

// ========== USERS ==========
adminRouter.get("/users", zValidator("query", paginationSchema), async (c) => {
  const { page, limit } = c.req.valid("query");
  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: limit,
      orderBy: { id: "asc" },
      select: {
        id: true,
        userName: true,
        email: true,
        role: true,
        isActivated: true,
        isBlocked: true,
        diskSpace: true,
        usedSpace: true,
        createdAt: true,
      },
    }),
    prisma.user.count(),
  ]);
  return c.json({
    data: users.map((u) => ({
      ...u,
      diskSpace: u.diskSpace.toString(),
      usedSpace: u.usedSpace.toString(),
    })),
    total,
    page,
    limit,
  });
});

adminRouter.get("/users/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isFinite(id)) return c.json({ message: "Invalid id" }, 400);
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      userName: true,
      email: true,
      role: true,
      isActivated: true,
      isBlocked: true,
      diskSpace: true,
      usedSpace: true,
      storageGuid: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!user) return c.json({ message: "User not found" }, 404);
  return c.json({
    ...user,
    diskSpace: user.diskSpace.toString(),
    usedSpace: user.usedSpace.toString(),
  });
});

const updateUserSchema = z.object({
  userName: z.string().min(1).optional(),
  role: z.enum(["USER", "ADMIN"]).optional(),
  isActivated: z.boolean().optional(),
  isBlocked: z.boolean().optional(),
  diskSpace: z.coerce.number().min(0).optional(),
});

adminRouter.patch("/users/:id", zValidator("json", updateUserSchema), async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isFinite(id)) return c.json({ message: "Invalid id" }, 400);
  const body = c.req.valid("json");
  const updateData: Record<string, unknown> = {};
  if (body.userName !== undefined) updateData.userName = body.userName;
  if (body.role !== undefined) updateData.role = body.role;
  if (body.isActivated !== undefined) updateData.isActivated = body.isActivated;
  if (body.isBlocked !== undefined) updateData.isBlocked = body.isBlocked;
  if (body.diskSpace !== undefined) updateData.diskSpace = BigInt(body.diskSpace);
  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    select: { id: true, userName: true, email: true, role: true, isActivated: true, isBlocked: true, diskSpace: true, usedSpace: true },
  });
  return c.json({
    ...user,
    diskSpace: user.diskSpace.toString(),
    usedSpace: user.usedSpace.toString(),
  });
});

// ========== FILES (no name/path/url — sensitive) ==========
adminRouter.get("/files", zValidator("query", paginationSchema), async (c) => {
  const { page, limit } = c.req.valid("query");
  const skip = (page - 1) * limit;
  const [files, total] = await Promise.all([
    prisma.file.findMany({
      skip,
      take: limit,
      orderBy: { id: "desc" },
      select: {
        id: true,
        type: true,
        size: true,
        userId: true,
        createdAt: true,
        user: { select: { id: true, email: true } },
      },
    }),
    prisma.file.count(),
  ]);
  return c.json({ data: files, total, page, limit });
});

adminRouter.delete("/files/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isFinite(id)) return c.json({ message: "Invalid id" }, 400);
  await prisma.file.delete({ where: { id } });
  return c.json({ ok: true });
});

// ========== NOTES (no title/content/tags — sensitive) ==========
adminRouter.get("/notes", zValidator("query", paginationSchema), async (c) => {
  const { page, limit } = c.req.valid("query");
  const skip = (page - 1) * limit;
  const [notes, total] = await Promise.all([
    prisma.note.findMany({
      skip,
      take: limit,
      orderBy: { id: "desc" },
      select: {
        id: true,
        userId: true,
        isStarred: true,
        isRemoved: true,
        createdAt: true,
        user: { select: { id: true, email: true } },
      },
    }),
    prisma.note.count(),
  ]);
  return c.json({ data: notes, total, page, limit });
});

adminRouter.delete("/notes/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isFinite(id)) return c.json({ message: "Invalid id" }, 400);
  await prisma.note.delete({ where: { id } });
  return c.json({ ok: true });
});

// ========== INVITES ==========
adminRouter.get("/invites", zValidator("query", paginationSchema), async (c) => {
  const { page, limit } = c.req.valid("query");
  const skip = (page - 1) * limit;
  const [invites, total] = await Promise.all([
    prisma.invite.findMany({
      skip,
      take: limit,
      orderBy: { id: "desc" },
      select: { id: true, userName: true, email: true, isUsed: true, createdAt: true },
    }),
    prisma.invite.count(),
  ]);
  return c.json({ data: invites, total, page, limit });
});

// ========== SESSIONS (read-only) ==========
adminRouter.get("/sessions", zValidator("query", paginationSchema), async (c) => {
  const { page, limit } = c.req.valid("query");
  const skip = (page - 1) * limit;
  const [sessions, total] = await Promise.all([
    prisma.session.findMany({
      skip,
      take: limit,
      orderBy: { lastActivity: "desc" },
      include: { user: { select: { id: true, userName: true, email: true } } },
    }),
    prisma.session.count(),
  ]);
  return c.json({ data: sessions, total, page, limit });
});

// ========== TASKS (no title/content/description — sensitive) ==========
adminRouter.get("/tasks", zValidator("query", paginationSchema), async (c) => {
  const { page, limit } = c.req.valid("query");
  const skip = (page - 1) * limit;
  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      skip,
      take: limit,
      orderBy: { id: "desc" },
      select: {
        id: true,
        userId: true,
        status: true,
        priority: true,
        createdAt: true,
        user: { select: { id: true, email: true } },
      },
    }),
    prisma.task.count(),
  ]);
  return c.json({ data: tasks, total, page, limit });
});

adminRouter.delete("/tasks/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isFinite(id)) return c.json({ message: "Invalid id" }, 400);
  await prisma.task.delete({ where: { id } });
  return c.json({ ok: true });
});

// ========== EVENTS (no title/description — sensitive) ==========
adminRouter.get("/events", zValidator("query", paginationSchema), async (c) => {
  const { page, limit } = c.req.valid("query");
  const skip = (page - 1) * limit;
  const [events, total] = await Promise.all([
    prisma.calendarEvent.findMany({
      skip,
      take: limit,
      orderBy: { id: "desc" },
      select: {
        id: true,
        userId: true,
        startDate: true,
        endDate: true,
        createdAt: true,
        user: { select: { id: true, email: true } },
      },
    }),
    prisma.calendarEvent.count(),
  ]);
  return c.json({ data: events, total, page, limit });
});

adminRouter.delete("/events/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isFinite(id)) return c.json({ message: "Invalid id" }, 400);
  await prisma.calendarEvent.delete({ where: { id } });
  return c.json({ ok: true });
});

// ========== BOARDS (Kanban; title kept for moderation, or remove if sensitive) ==========
adminRouter.get("/boards", zValidator("query", paginationSchema), async (c) => {
  const { page, limit } = c.req.valid("query");
  const skip = (page - 1) * limit;
  const [boards, total] = await Promise.all([
    prisma.kanbanBoard.findMany({
      skip,
      take: limit,
      orderBy: { id: "desc" },
      select: {
        id: true,
        userId: true,
        createdAt: true,
        user: { select: { id: true, email: true } },
      },
    }),
    prisma.kanbanBoard.count(),
  ]);
  return c.json({ data: boards, total, page, limit });
});

adminRouter.delete("/boards/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isFinite(id)) return c.json({ message: "Invalid id" }, 400);
  await prisma.kanbanBoard.delete({ where: { id } });
  return c.json({ ok: true });
});

// ========== STATS (dashboard metrics) ==========
adminRouter.get("/stats", async (c) => {
  const [storageAgg, usersCount, filesCount, notesCount, activeByDay] = await Promise.all([
    prisma.user.aggregate({
      _sum: { usedSpace: true, diskSpace: true },
      _count: { id: true },
    }),
    prisma.user.count(),
    prisma.file.count(),
    prisma.note.count(),
    prisma.$queryRaw<Array<{ day: Date; count: bigint }>>`
      SELECT "lastActivity"::date as day, COUNT(DISTINCT "userId")::bigint as count
      FROM "Session"
      WHERE "lastActivity" >= NOW() - INTERVAL '14 days'
      GROUP BY "lastActivity"::date
      ORDER BY day ASC
    `,
  ]);

  const totalStorageUsed = storageAgg._sum.usedSpace ?? BigInt(0);
  const totalStorageLimit = storageAgg._sum.diskSpace ?? BigInt(0);
  const usagePercent =
    totalStorageLimit > BigInt(0)
      ? Number((totalStorageUsed * BigInt(100)) / totalStorageLimit)
      : 0;

  return c.json({
    totalStorageUsed: totalStorageUsed.toString(),
    totalStorageLimit: totalStorageLimit.toString(),
    usagePercent,
    usersCount,
    filesCount,
    notesCount,
    activeUsersByDay: activeByDay.map((r) => ({
      date: r.day instanceof Date ? r.day.toISOString().slice(0, 10) : String(r.day).slice(0, 10),
      count: Number(r.count),
    })),
  });
});

// Health for admin route
adminRouter.get("/", (c) => c.json({ ok: true, message: "Admin API" }));

export default adminRouter;
