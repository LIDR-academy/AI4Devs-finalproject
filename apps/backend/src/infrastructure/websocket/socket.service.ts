import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { env } from '@/config/env';

export class SocketService {
  private static instance: SocketService;
  private io: Server;

  private constructor(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: env.CORS_ORIGIN,
        methods: ['GET', 'POST'],
      },
    });

    this.setupAuthMiddleware();
    this.setupConnectionHandler();
  }

  public static initialize(httpServer: HttpServer): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService(httpServer);
    }
    return SocketService.instance;
  }

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      throw new Error('SocketService not initialized. Call initialize() first.');
    }
    return SocketService.instance;
  }

  private setupAuthMiddleware() {
    this.io.use((socket: Socket, next) => {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as any;
        socket.data.user = decoded;
        next();
      } catch (err) {
        return next(new Error('Authentication error: Invalid token'));
      }
    });
  }

  private setupConnectionHandler() {
    this.io.on('connection', (socket: Socket) => {
      const userId = socket.data.user.userId;
      console.log(`🔌 Client connected: ${socket.id} (User: ${userId})`);

      // Join user-specific room
      socket.join(`user:${userId}`);

      socket.on('disconnect', () => {
        console.log(`❌ Client disconnected: ${socket.id}`);
      });
    });
  }

  public notifyUser(userId: string, event: string, payload: any) {
    this.io.to(`user:${userId}`).emit(event, payload);
  }
}
