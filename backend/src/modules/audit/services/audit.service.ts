import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan } from 'typeorm';
import { AuditLog, AuditAction } from '../entities/audit-log.entity';
import { CreateAuditLogDto } from '../dto/create-audit-log.dto';
import { QueryAuditLogDto } from '../dto/query-audit-log.dto';
import { GdprExportDto } from '../dto/gdpr-export.dto';
import { MetricsService } from '../../monitoring/metrics.service';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
    private metricsService: MetricsService,
  ) {}

  /**
   * Registra una acción en el log de auditoría
   */
  async log(dto: CreateAuditLogDto): Promise<AuditLog> {
    try {
      const auditLog = this.auditLogRepository.create(dto);
      const saved = await this.auditLogRepository.save(auditLog);
      this.metricsService.recordAuditLog(dto.action, dto.entityType || 'unknown');
      return saved;
    } catch (error) {
      this.logger.error(`Error al registrar auditoría: ${error.message}`, error.stack);
      // No lanzamos error para no interrumpir el flujo principal
      throw error;
    }
  }

  /**
   * Consulta logs de auditoría con filtros
   */
  async query(dto: QueryAuditLogDto): Promise<{ data: AuditLog[]; total: number }> {
    const queryBuilder = this.auditLogRepository.createQueryBuilder('audit');

    if (dto.userId) {
      queryBuilder.andWhere('audit.userId = :userId', { userId: dto.userId });
    }

    if (dto.action) {
      queryBuilder.andWhere('audit.action = :action', { action: dto.action });
    }

    if (dto.entityType) {
      queryBuilder.andWhere('audit.entityType = :entityType', { entityType: dto.entityType });
    }

    if (dto.entityId) {
      queryBuilder.andWhere('audit.entityId = :entityId', { entityId: dto.entityId });
    }

    if (dto.startDate || dto.endDate) {
      if (dto.startDate && dto.endDate) {
        queryBuilder.andWhere('audit.createdAt BETWEEN :startDate AND :endDate', {
          startDate: dto.startDate,
          endDate: dto.endDate,
        });
      } else if (dto.startDate) {
        queryBuilder.andWhere('audit.createdAt >= :startDate', { startDate: dto.startDate });
      } else if (dto.endDate) {
        queryBuilder.andWhere('audit.createdAt <= :endDate', { endDate: dto.endDate });
      }
    }

    queryBuilder
      .orderBy('audit.createdAt', 'DESC')
      .take(dto.limit || 50)
      .skip(dto.offset || 0);

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total };
  }

  /**
   * Obtiene un log específico por ID
   */
  async findById(id: string): Promise<AuditLog> {
    const log = await this.auditLogRepository.findOne({ where: { id } });
    if (!log) {
      throw new NotFoundException(`Log de auditoría con ID ${id} no encontrado`);
    }
    return log;
  }

  /**
   * Obtiene todos los logs de un usuario (para GDPR)
   */
  async findByUserId(userId: string): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Exporta datos de un usuario para cumplimiento GDPR
   */
  async exportUserData(dto: GdprExportDto): Promise<{
    userId: string;
    logs: AuditLog[];
    summary: {
      totalActions: number;
      actionsByType: Record<string, number>;
      dateRange: { start: Date | null; end: Date | null };
    };
  }> {
    const queryBuilder = this.auditLogRepository
      .createQueryBuilder('audit')
      .where('audit.userId = :userId', { userId: dto.userId });

    if (dto.startDate) {
      queryBuilder.andWhere('audit.createdAt >= :startDate', { startDate: dto.startDate });
    }

    if (dto.endDate) {
      queryBuilder.andWhere('audit.createdAt <= :endDate', { endDate: dto.endDate });
    }

    const logs = await queryBuilder.orderBy('audit.createdAt', 'DESC').getMany();

    // Calcular resumen
    const actionsByType: Record<string, number> = {};
    let earliestDate: Date | null = null;
    let latestDate: Date | null = null;

    logs.forEach((log) => {
      actionsByType[log.action] = (actionsByType[log.action] || 0) + 1;
      if (!earliestDate || log.createdAt < earliestDate) {
        earliestDate = log.createdAt;
      }
      if (!latestDate || log.createdAt > latestDate) {
        latestDate = log.createdAt;
      }
    });

    return {
      userId: dto.userId,
      logs,
      summary: {
        totalActions: logs.length,
        actionsByType,
        dateRange: {
          start: earliestDate,
          end: latestDate,
        },
      },
    };
  }

  /**
   * Anonimiza logs de un usuario (GDPR - Derecho al olvido)
   * Mantiene la trazabilidad mientras protege la privacidad
   */
  async anonymizeUserLogs(userId: string): Promise<number> {
    this.logger.log(`Anonimizando logs del usuario ${userId} (GDPR)`);
    const result = await this.auditLogRepository.update(
      { userId },
      {
        userId: '00000000-0000-0000-0000-000000000000', // UUID de anonimización
        changes: null, // Eliminar datos sensibles
        ipAddress: null,
        userAgent: null,
      },
    );
    this.logger.log(`Se anonimizaron ${result.affected || 0} logs del usuario ${userId}`);
    return result.affected || 0;
  }

  /**
   * Elimina completamente los logs de un usuario (GDPR - Derecho al olvido completo)
   * ⚠️ ADVERTENCIA: Esta acción es irreversible y elimina toda la trazabilidad
   * Solo usar cuando no hay obligaciones legales de retención
   */
  async deleteUserLogs(userId: string): Promise<number> {
    this.logger.warn(`Eliminando completamente logs del usuario ${userId} (GDPR - Eliminación completa)`);
    const result = await this.auditLogRepository.delete({ userId });
    this.logger.warn(`Se eliminaron ${result.affected || 0} logs del usuario ${userId}`);
    return result.affected || 0;
  }

  /**
   * Elimina logs antiguos (retención de datos)
   */
  async deleteOldLogs(retentionDays: number = 2555): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await this.auditLogRepository.delete({
      createdAt: LessThan(cutoffDate),
    });

    return result.affected || 0;
  }

  /**
   * Obtiene estadísticas de auditoría
   */
  async getStatistics(days: number = 30): Promise<{
    totalActions: number;
    actionsByType: Record<string, number>;
    actionsByEntity: Record<string, number>;
    topUsers: Array<{ userId: string; count: number }>;
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await this.auditLogRepository.find({
      where: {
        createdAt: Between(startDate, new Date()),
      },
    });

    const actionsByType: Record<string, number> = {};
    const actionsByEntity: Record<string, number> = {};
    const userCounts: Record<string, number> = {};

    logs.forEach((log) => {
      actionsByType[log.action] = (actionsByType[log.action] || 0) + 1;
      if (log.entityType) {
        actionsByEntity[log.entityType] = (actionsByEntity[log.entityType] || 0) + 1;
      }
      userCounts[log.userId] = (userCounts[log.userId] || 0) + 1;
    });

    const topUsers = Object.entries(userCounts)
      .map(([userId, count]) => ({ userId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalActions: logs.length,
      actionsByType,
      actionsByEntity,
      topUsers,
    };
  }
}
