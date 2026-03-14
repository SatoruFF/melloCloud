import { prisma } from "../configs/config.js";
import { ResourceType } from "@prisma/client";
import createError from "http-errors";

// Default config values (used when no row in DB yet)
const DEFAULT_CONFIG = {
  id: 1,
  isEnabled: false,
  freeStorageBytes: BigInt(104857600),   // 100 MB
  freeMaxNotes: 100,
  freeMaxCollaborators: 5,
  freeVideoCall: false,
  proPriceUsd: 9.99,
  proPriceRub: 990,
  proStorageBytes: BigInt(10737418240),  // 10 GB
  proMaxNotes: 0,
  proMaxCollaborators: 0,
  proVideoCall: true,
  enterprisePriceUsd: 29.99,
  enterprisePriceRub: 2990,
  enterpriseStorageBytes: BigInt(0),
  enterpriseMaxNotes: 0,
  enterpriseMaxCollaborators: 0,
  enterpriseVideoCall: true,
  updatedAt: new Date(),
};

// In-memory cache (cleared on update)
let configCache: typeof DEFAULT_CONFIG | null = null;

export async function getConfig() {
  if (configCache) return configCache;
  const cfg = await prisma.subscriptionConfig.findUnique({ where: { id: 1 } });
  configCache = cfg ? (cfg as typeof DEFAULT_CONFIG) : DEFAULT_CONFIG;
  return configCache;
}

export async function updateConfig(data: Partial<Omit<typeof DEFAULT_CONFIG, "id" | "updatedAt">>) {
  configCache = null; // invalidate cache
  const cfg = await prisma.subscriptionConfig.upsert({
    where: { id: 1 },
    create: { ...DEFAULT_CONFIG, ...data, id: 1 },
    update: data,
  });
  return cfg;
}

// ===================================================
// Helpers: get effective plan + plan limits for user
// ===================================================

export function getEffectivePlan(user: { subscriptionPlan: string; subscriptionExpiresAt: Date | null }): string {
  if (user.subscriptionPlan === "FREE") return "FREE";
  if (user.subscriptionExpiresAt && user.subscriptionExpiresAt < new Date()) return "FREE";
  return user.subscriptionPlan;
}

export async function getPlanLimits(plan: string) {
  const cfg = await getConfig();
  switch (plan) {
    case "PRO":
      return {
        storageBytes: cfg.proStorageBytes,
        maxNotes: cfg.proMaxNotes,
        maxCollaborators: cfg.proMaxCollaborators,
        videoCall: cfg.proVideoCall,
      };
    case "ENTERPRISE":
      return {
        storageBytes: cfg.enterpriseStorageBytes,
        maxNotes: cfg.enterpriseMaxNotes,
        maxCollaborators: cfg.enterpriseMaxCollaborators,
        videoCall: cfg.enterpriseVideoCall,
      };
    default:
      return {
        storageBytes: cfg.freeStorageBytes,
        maxNotes: cfg.freeMaxNotes,
        maxCollaborators: cfg.freeMaxCollaborators,
        videoCall: cfg.freeVideoCall,
      };
  }
}

// ===================================================
// Limit checks
// ===================================================

/** Check if userId can create another note. Throws 403 if limit reached. */
export async function checkNoteLimit(userId: number): Promise<void> {
  const cfg = await getConfig();
  if (!cfg.isEnabled) return; // subscriptions disabled — no limits

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionPlan: true, subscriptionExpiresAt: true },
  });
  if (!user) return;

  const plan = getEffectivePlan(user);
  const limits = await getPlanLimits(plan);
  if (limits.maxNotes === 0) return; // unlimited

  const count = await prisma.note.count({
    where: { userId, isRemoved: false },
  });
  if (count >= limits.maxNotes) {
    throw createError(403, "NOTE_LIMIT_EXCEEDED");
  }
}

/** Check if granter can add more collaborators to a resource. Throws 403 if limit reached. */
export async function checkCollaboratorLimit(
  resourceType: ResourceType,
  resourceId: number,
  granterId: number
): Promise<void> {
  const cfg = await getConfig();
  if (!cfg.isEnabled) return;

  const user = await prisma.user.findUnique({
    where: { id: granterId },
    select: { subscriptionPlan: true, subscriptionExpiresAt: true },
  });
  if (!user) return;

  const plan = getEffectivePlan(user);
  const limits = await getPlanLimits(plan);
  if (limits.maxCollaborators === 0) return; // unlimited

  const count = await prisma.permission.count({
    where: { resourceType, resourceId, isPublic: false },
  });
  if (count >= limits.maxCollaborators) {
    throw createError(403, "COLLABORATOR_LIMIT_EXCEEDED");
  }
}

/** Public config for frontend (pricing page) — serializes BigInts */
export async function getPublicConfig() {
  const cfg = await getConfig();
  return {
    isEnabled: cfg.isEnabled,
    freeStorageBytes: cfg.freeStorageBytes.toString(),
    freeMaxNotes: cfg.freeMaxNotes,
    freeMaxCollaborators: cfg.freeMaxCollaborators,
    freeVideoCall: cfg.freeVideoCall,
    proPriceUsd: Number(cfg.proPriceUsd),
    proPriceRub: Number(cfg.proPriceRub),
    proStorageBytes: cfg.proStorageBytes.toString(),
    proMaxNotes: cfg.proMaxNotes,
    proMaxCollaborators: cfg.proMaxCollaborators,
    proVideoCall: cfg.proVideoCall,
    enterprisePriceUsd: Number(cfg.enterprisePriceUsd),
    enterprisePriceRub: Number(cfg.enterprisePriceRub),
    enterpriseStorageBytes: cfg.enterpriseStorageBytes.toString(),
    enterpriseMaxNotes: cfg.enterpriseMaxNotes,
    enterpriseMaxCollaborators: cfg.enterpriseMaxCollaborators,
    enterpriseVideoCall: cfg.enterpriseVideoCall,
  };
}

/** Storage bytes for a given plan (for setting diskSpace on upgrade) */
export async function getStorageBytesForPlan(plan: string): Promise<bigint> {
  const cfg = await getConfig();
  switch (plan) {
    case "PRO": return cfg.proStorageBytes > 0n ? cfg.proStorageBytes : BigInt(10737418240);
    case "ENTERPRISE": return cfg.enterpriseStorageBytes > 0n ? cfg.enterpriseStorageBytes : BigInt(107374182400);
    default: return cfg.freeStorageBytes;
  }
}
