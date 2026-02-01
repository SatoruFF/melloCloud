import { prisma } from "../configs/config.js";

/** Результат: включён ли флаг для пользователя. Сначала проверяем per-user, иначе глобальный isEnabled. */
export async function getFlagsForUser(userId: number): Promise<Record<string, boolean>> {
  const flags = await prisma.featureFlag.findMany({
    where: {},
    include: {
      enabledForUsers: {
        where: { userId },
        select: { isEnabled: true },
      },
    },
  });

  const result: Record<string, boolean> = {};
  for (const flag of flags) {
    const userOverride = flag.enabledForUsers[0];
    if (userOverride !== undefined) {
      result[flag.key] = userOverride.isEnabled;
    } else {
      result[flag.key] = flag.isEnabled;
    }
  }
  return result;
}

export async function listFlags() {
  return prisma.featureFlag.findMany({
    orderBy: { key: "asc" },
    include: {
      _count: { select: { enabledForUsers: true } },
    },
  });
}

export async function createFlag(data: { key: string; name: string; description?: string; isEnabled?: boolean }) {
  return prisma.featureFlag.create({
    data: {
      key: data.key,
      name: data.name,
      description: data.description ?? null,
      isEnabled: data.isEnabled ?? false,
    },
  });
}

export async function updateFlag(
  id: number,
  data: { key?: string; name?: string; description?: string; isEnabled?: boolean }
) {
  return prisma.featureFlag.update({
    where: { id },
    data: {
      ...(data.key !== undefined && { key: data.key }),
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.isEnabled !== undefined && { isEnabled: data.isEnabled }),
    },
  });
}

export async function deleteFlag(id: number) {
  return prisma.featureFlag.delete({ where: { id } });
}

/** Включить/выключить флаг для конкретного пользователя (per-user override). */
export async function setUserFlag(featureFlagId: number, userId: number, isEnabled: boolean) {
  await prisma.userFeatureFlag.upsert({
    where: {
      userId_featureFlagId: { userId, featureFlagId },
    },
    create: { userId, featureFlagId, isEnabled },
    update: { isEnabled },
  });
  return { ok: true };
}

/** Убрать per-user override (будет использоваться глобальный isEnabled). */
export async function removeUserFlag(featureFlagId: number, userId: number) {
  await prisma.userFeatureFlag.deleteMany({
    where: { featureFlagId, userId },
  });
  return { ok: true };
}

/** Список per-user overrides для флага (для админки). */
export async function getFlagUsers(featureFlagId: number) {
  const rows = await prisma.userFeatureFlag.findMany({
    where: { featureFlagId },
    include: {
      user: {
        select: { id: true, userName: true, email: true },
      },
    },
    orderBy: { userId: "asc" },
  });
  return rows.map((r) => ({
    userId: r.userId,
    isEnabled: r.isEnabled,
    user: r.user,
  }));
}
