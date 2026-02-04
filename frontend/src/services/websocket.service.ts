import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';

class WebSocketService {
  private socket: Socket | null = null;
  private connected = false;

  connect(namespace: string = '/documentation'): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    const token = useAuthStore.getState().token;
    const baseURL = import.meta.env.VITE_WS_URL || window.location.origin;

    this.socket = io(`${baseURL}${namespace}`, {
      transports: ['websocket', 'polling'],
      auth: {
        token,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      this.connected = true;
    });

    this.socket.on('disconnect', () => {
      this.connected = false;
    });

    this.socket.on('connect_error', () => {
      this.connected = false;
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  isConnected(): boolean {
    return this.connected && this.socket?.connected === true;
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

export default new WebSocketService();
