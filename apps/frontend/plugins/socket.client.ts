import { io } from "socket.io-client";
import { useAuthStore } from "~/stores/auth";

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();
  
  // Inicializar socket solo en el cliente
  if (import.meta.client) {
    const authStore = useAuthStore();
    
    const socket = io(config.public.socketUrl, {
        autoConnect: false, // Control manual de conexión
        auth: {
          token: authStore.token
        }
    });

    // Reactivar conexión cuando cambia el token
    watch(() => authStore.token, (newToken) => {
      if (newToken) {
        socket.auth = { token: newToken };
        if (!socket.connected) {
          socket.connect();
        }
      } else {
        if (socket.connected) {
          socket.disconnect();
        }
      }
    }, { immediate: true });

    return {
        provide: {
        socket: socket,
        },
    };
  }
});
