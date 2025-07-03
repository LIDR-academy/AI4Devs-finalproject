/**
 * plugins/notivue.client.ts
 * Plugin para implementar un sistema de notificaciones personalizado
 * Reemplaza Notivue para evitar errores de tiempo de ejecución
 */
import { defineNuxtPlugin } from 'nuxt/app';
import { ref, reactive } from 'vue';
import type { Notification, NotificationsInterface, ToastInterface } from '../types/notivue';

export default defineNuxtPlugin((nuxtApp) => {
  try {
    // ID para las notificaciones
    let nextId = 1;
    
    // Lista reactiva de notificaciones
    const notificationsList = reactive<Notification[]>([]);
    
    // Función para personalizar mensajes de bienvenida según el usuario
    const getWelcomeMessage = () => {
      try {
        // Intentar obtener el nombre del usuario del localStorage
        if (typeof window === 'undefined') return '¡Bienvenido a la aplicación!';
        
        const userData = localStorage.getItem('userData');
        if (userData) {
          const parsedData = JSON.parse(userData);
          if (parsedData && parsedData.name) {
            return `¡Bienvenido de nuevo, ${parsedData.name}!`;
          }
        }
        return '¡Bienvenido a la aplicación!';
      } catch (error) {
        console.error('Error al obtener datos del usuario:', error);
        return '¡Bienvenido a la aplicación!';
      }
    };
    
    // Sistema de notificaciones que implementa NotificationsInterface
    const notifications: NotificationsInterface = {
      list: notificationsList,
      
      // Añadir una nueva notificación
      add: (type: 'success' | 'error' | 'info' | 'warning', content: string, duration = 5000): number => {
        try {
          // Personalizar mensaje si es de bienvenida
          if (content.includes('¡Bienvenido') || content.includes('Bienvenido')) {
            content = getWelcomeMessage();
          }
          
          const id = nextId++;
          const notification: Notification = { 
            id, 
            type, 
            content, 
            timestamp: new Date() 
          };
          
          // Añadir a la lista
          notificationsList.push(notification);
          
          // Eliminar automáticamente después de la duración
          if (duration > 0) {
            setTimeout(() => {
              notifications.remove(id);
            }, duration);
          }
          
          return id;
        } catch (error) {
          console.error('Error al añadir notificación:', error);
          return -1;
        }
      },
      
      // Eliminar una notificación por ID
      remove: (id: number): void => {
        try {
          const index = notificationsList.findIndex(n => n.id === id);
          if (index !== -1) {
            notificationsList.splice(index, 1);
          }
        } catch (error) {
          console.error('Error al eliminar notificación:', error);
        }
      },
      
      // Limpiar todas las notificaciones
      clear: (): void => {
        try {
          notificationsList.splice(0, notificationsList.length);
        } catch (error) {
          console.error('Error al limpiar notificaciones:', error);
        }
      }
    };
    
    // Crear interfaz de toast compatible con la anterior
    const toast: ToastInterface = {
      success: (message: string, options = {}) => notifications.add('success', message, options.duration || 5000),
      error: (message: string, options = {}) => notifications.add('error', message, options.duration || 5000),
      info: (message: string, options = {}) => notifications.add('info', message, options.duration || 5000),
      warning: (message: string, options = {}) => notifications.add('warning', message, options.duration || 5000),
    };
    
    // Proporcionar tanto el sistema de notificaciones como la interfaz de toast a través del return
    return {
      provide: {
        notifications,
        toast
      }
    };
  } catch (error) {
    console.error('Error inicializando sistema de notificaciones:', error);
    
    // Proporcionar una interfaz de fallback en caso de error
    const fallbackToast: ToastInterface = {
      success: (message: string, options = {}) => { console.log('Success:', message); return -1; },
      error: (message: string, options = {}) => { console.error('Error:', message); return -1; },
      info: (message: string, options = {}) => { console.info('Info:', message); return -1; },
      warning: (message: string, options = {}) => { console.warn('Warning:', message); return -1; },
    };
    
    const fallbackNotifications: NotificationsInterface = {
      list: [] as Notification[],
      add: (_type: 'success' | 'error' | 'info' | 'warning', _content: string, _duration = 0) => -1,
      remove: (_id: number): void => {},
      clear: (): void => {}
    };
    
    // Proporcionar fallbacks a través del return
    return {
      provide: {
        notifications: fallbackNotifications,
        toast: fallbackToast
      }
    };
  }
});
