import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { DocumentationService } from './services/documentation.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  surgeryId?: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGINS?.split(',') || '*',
    credentials: true,
  },
  namespace: '/documentation',
})
export class DocumentationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(DocumentationGateway.name);
  private readonly connectedClients = new Map<string, Set<string>>(); // surgeryId -> Set of socketIds

  constructor(private readonly documentationService: DocumentationService) {}

  async handleConnection(client: AuthenticatedSocket) {
    this.logger.log(`Cliente conectado: ${client.id}`);
    
    // En producción, aquí se validaría el token JWT del cliente
    // Por ahora, permitimos la conexión
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    this.logger.log(`Cliente desconectado: ${client.id}`);
    
    // Remover de la lista de clientes conectados
    if (client.surgeryId) {
      const clients = this.connectedClients.get(client.surgeryId);
      if (clients) {
        clients.delete(client.id);
        if (clients.size === 0) {
          this.connectedClients.delete(client.surgeryId);
        }
      }
    }
  }

  @SubscribeMessage('join-surgery')
  async handleJoinSurgery(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { surgeryId: string; userId: string },
  ) {
    try {
      const { surgeryId, userId } = data;
      
      // Verificar que la documentación existe (o crearla si es la primera vez)
      await this.documentationService.findBySurgeryId(surgeryId, userId);
      
      // Unir al cliente a la sala de la cirugía
      client.join(`surgery:${surgeryId}`);
      client.surgeryId = surgeryId;
      client.userId = userId;
      
      // Registrar cliente conectado
      if (!this.connectedClients.has(surgeryId)) {
        this.connectedClients.set(surgeryId, new Set());
      }
      this.connectedClients.get(surgeryId)!.add(client.id);
      
      this.logger.log(
        `Cliente ${client.id} (usuario ${userId}) se unió a cirugía ${surgeryId}`,
      );
      
      // Notificar a otros clientes
      client.to(`surgery:${surgeryId}`).emit('user-joined', {
        userId,
        socketId: client.id,
        timestamp: new Date().toISOString(),
      });
      
      return {
        success: true,
        message: `Conectado a documentación de cirugía ${surgeryId}`,
      };
    } catch (error: any) {
      this.logger.error(`Error en join-surgery: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @SubscribeMessage('leave-surgery')
  async handleLeaveSurgery(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { surgeryId: string },
  ) {
    const { surgeryId } = data;
    client.leave(`surgery:${surgeryId}`);
    
    if (client.surgeryId === surgeryId) {
      const clients = this.connectedClients.get(surgeryId);
      if (clients) {
        clients.delete(client.id);
      }
      client.surgeryId = undefined;
    }
    
    this.logger.log(`Cliente ${client.id} dejó cirugía ${surgeryId}`);
    
    return { success: true };
  }

  @SubscribeMessage('update-field')
  async handleUpdateField(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody()
    data: {
      documentationId: string;
      field: string;
      value: any;
      userId: string;
    },
  ) {
    try {
      const { documentationId, field, value, userId } = data;
      
      // Actualizar en base de datos
      const updated = await this.documentationService.updateField(
        documentationId,
        field,
        value,
        userId,
      );
      
      // Emitir actualización a todos los clientes en la sala
      if (client.surgeryId) {
        this.server.to(`surgery:${client.surgeryId}`).emit('field-updated', {
          documentationId,
          field,
          value,
          userId,
          timestamp: new Date().toISOString(),
          lastSavedAt: updated.lastSavedAt,
        });
      }
      
      return {
        success: true,
        data: updated,
      };
    } catch (error: any) {
      this.logger.error(`Error en update-field: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @SubscribeMessage('auto-save')
  async handleAutoSave(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody()
    data: {
      documentationId: string;
      data: any;
    },
  ) {
    try {
      const { documentationId, data: updateData } = data;
      
      // Auto-guardar sin crear historial detallado
      await this.documentationService.autoSave(documentationId, updateData);
      
      // Notificar que se guardó
      if (client.surgeryId) {
        client.emit('auto-saved', {
          documentationId,
          timestamp: new Date().toISOString(),
        });
      }
      
      return { success: true };
    } catch (error: any) {
      this.logger.error(`Error en auto-save: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @SubscribeMessage('typing')
  async handleTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { userId: string; field: string; isTyping: boolean },
  ) {
    if (client.surgeryId) {
      // Notificar a otros usuarios que alguien está escribiendo
      client.to(`surgery:${client.surgeryId}`).emit('user-typing', {
        userId: data.userId,
        field: data.field,
        isTyping: data.isTyping,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Emitir evento de actualización a todos los clientes de una cirugía
   */
  emitToSurgery(surgeryId: string, event: string, data: any) {
    this.server.to(`surgery:${surgeryId}`).emit(event, data);
  }

  /**
   * Obtener número de clientes conectados a una cirugía
   */
  getConnectedClientsCount(surgeryId: string): number {
    return this.connectedClients.get(surgeryId)?.size || 0;
  }
}
