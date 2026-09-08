import type { SystemSettings } from "@/domain/settings/system-settings";

/** Puerto de los parámetros configurables del sistema. */
export interface SettingsRepository {
  /** Todos los parámetros, ya resueltos con sus valores por defecto. */
  load(): Promise<SystemSettings>;
}
