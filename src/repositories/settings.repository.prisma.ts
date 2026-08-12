import { prisma } from "@/db/prisma";
import { resolveSettings } from "@/domain/settings/system-settings";
import type { SettingsRepository } from "@/repositories/settings.repository";

/** Adaptador Prisma del puerto `SettingsRepository`. */
export const prismaSettingsRepository: SettingsRepository = {
  async load() {
    const rows = await prisma.systemSetting.findMany({ select: { key: true, value: true } });
    const stored = Object.fromEntries(rows.map((row) => [row.key, row.value]));
    return resolveSettings(stored);
  },
};
