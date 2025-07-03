/**
 * composables/useToast.ts
 * Composable para acceder al objeto toast tipado
 */

import { useNuxtApp } from 'nuxt/app';
import type { ToastInterface } from '../types/notivue';

/**
 * Función auxiliar para acceder al toast tipado
 * @returns Objeto toast con métodos tipados
 */
export function useToast(): ToastInterface {
  const nuxtApp = useNuxtApp();
  return nuxtApp.$toast as ToastInterface;
}
