/**
 * composables/useToast.js
 * Composable para manejar notificaciones toast en la aplicación
 */
import { useToast as useVueToast } from 'vue-toastification';

export function useToast() {
  const toast = useVueToast();

  return {
    /**
     * Muestra una notificación de éxito
     * @param {string} message - Mensaje a mostrar
     * @param {object} options - Opciones adicionales para la notificación
     */
    success(message, options = {}) {
      toast.success(message, options);
    },

    /**
     * Muestra una notificación de error
     * @param {string} message - Mensaje a mostrar
     * @param {object} options - Opciones adicionales para la notificación
     */
    error(message, options = {}) {
      toast.error(message, options);
    },

    /**
     * Muestra una notificación de información
     * @param {string} message - Mensaje a mostrar
     * @param {object} options - Opciones adicionales para la notificación
     */
    info(message, options = {}) {
      toast.info(message, options);
    },

    /**
     * Muestra una notificación de advertencia
     * @param {string} message - Mensaje a mostrar
     * @param {object} options - Opciones adicionales para la notificación
     */
    warning(message, options = {}) {
      toast.warning(message, options);
    },

    /**
     * Elimina todas las notificaciones
     */
    clear() {
      toast.clear();
    }
  };
}
