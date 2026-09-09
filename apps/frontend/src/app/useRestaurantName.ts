import { useEffect, useState } from 'react';
import { SettingsService } from '../features/settings/services/settings.service.js';

const FALLBACK_NAME = 'RestoStock';

/**
 * Nombre del restaurante para el wordmark de la barra lateral (branding dinámico,
 * alineado con `TK-075-FE`). Cae al literal `"RestoStock"` si el endpoint de
 * configuración falla o aún no responde — la barra lateral nunca queda vacía.
 */
export function useRestaurantName(): string {
  const [name, setName] = useState<string>(FALLBACK_NAME);

  useEffect(() => {
    let cancelled = false;
    SettingsService.fetchSettings()
      .then((settings) => {
        if (!cancelled && settings.restaurantName?.trim()) {
          setName(settings.restaurantName.trim());
        }
      })
      .catch((err) => {
        console.error('[AppShell] No se pudo cargar el nombre del restaurante, usando fallback:', err);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return name;
}
