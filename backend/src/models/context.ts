import { prisma } from "../configs/config.js";
import { logger } from "../configs/logger.js";

export default class ApiContext {
  public userId: number | null;
  public logger: typeof logger;
  public prisma: typeof prisma;

  constructor(userId: unknown) {
    // user info
    if (typeof userId === "number" && Number.isFinite(userId)) {
      this.userId = userId;
    } else if (typeof userId === "string" && /^\d+$/.test(userId)) {
      this.userId = Number(userId);
    } else {
      this.userId = null;
    }
    // base winston logger
    this.logger = logger;
    // orm
    this.prisma = prisma;
  }
}
