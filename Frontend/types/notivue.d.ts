/**
 * types/notivue.d.ts
 * Declaración de tipos para el objeto toast de notivue
 */

import { NuxtApp } from 'nuxt/app';

// Interfaz para el objeto toast
export interface ToastInterface {
  success: (message: string, options?: Record<string, any>) => void;
  error: (message: string, options?: Record<string, any>) => void;
  info: (message: string, options?: Record<string, any>) => void;
  warning: (message: string, options?: Record<string, any>) => void;
  clear: () => void;
}

// Extender la interfaz NuxtApp para incluir $toast
declare module 'nuxt/app' {
  interface NuxtApp {
    $toast: ToastInterface;
  }
}

// Extender la interfaz ComponentCustomProperties para incluir $toast
import 'vue';
declare module 'vue' {
  interface ComponentCustomProperties {
    $toast: ToastInterface;
  }
}

// Declaración de la función auxiliar para acceder al toast tipado
export declare function useToast(): ToastInterface;

export {};
