import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Documentation, DocumentationStatus } from '../entities/documentation.entity';
import { DocumentationVersion } from '../entities/documentation-version.entity';
import { CreateDocumentationDto } from '../dto/create-documentation.dto';
import { UpdateDocumentationDto } from '../dto/update-documentation.dto';
import { Surgery } from '../../planning/entities/surgery.entity';

@Injectable()
export class DocumentationService {
  private readonly logger = new Logger(DocumentationService.name);

  constructor(
    @InjectRepository(Documentation)
    private readonly documentationRepository: Repository<Documentation>,
    @InjectRepository(DocumentationVersion)
    private readonly documentationVersionRepository: Repository<DocumentationVersion>,
    @InjectRepository(Surgery)
    private readonly surgeryRepository: Repository<Surgery>,
  ) {}

  /**
   * Crear nueva documentación para una cirugía
   */
  async create(
    createDto: CreateDocumentationDto,
    userId?: string,
  ): Promise<Documentation> {
    // Verificar que la cirugía existe
    const surgery = await this.surgeryRepository.findOne({
      where: { id: createDto.surgeryId },
    });

    if (!surgery) {
      throw new NotFoundException(
        `Cirugía con ID ${createDto.surgeryId} no encontrada`,
      );
    }

    // Verificar si ya existe documentación para esta cirugía
    const existing = await this.documentationRepository.findOne({
      where: { surgeryId: createDto.surgeryId },
    });

    if (existing) {
      throw new BadRequestException(
        'Ya existe documentación para esta cirugía',
      );
    }

    const documentation = this.documentationRepository.create({
      ...createDto,
      createdBy: userId ?? undefined,
      lastModifiedBy: userId ?? undefined,
      status: createDto.status || DocumentationStatus.DRAFT,
      changeHistory: [],
      lastSavedAt: new Date(),
    });

    const saved = await this.documentationRepository.save(documentation);
    this.logger.log(
      `Documentación creada: ${saved.id} para cirugía ${createDto.surgeryId}`,
    );

    return saved;
  }

  /**
   * Obtener documentación por ID de cirugía.
   * Si no existe, se crea automáticamente (find-or-create).
   */
  async findBySurgeryId(surgeryId: string, userId?: string): Promise<Documentation> {
    let documentation = await this.documentationRepository.findOne({
      where: { surgeryId },
      relations: ['surgery'],
    });

    if (!documentation) {
      documentation = await this.create(
        {
          surgeryId,
          status: DocumentationStatus.DRAFT,
        } as CreateDocumentationDto,
        userId,
      );
      // Recargar con relación surgery para respuesta consistente
      documentation = await this.documentationRepository.findOne({
        where: { id: documentation.id },
        relations: ['surgery'],
      });
    }

    return documentation;
  }

  /**
   * Actualizar documentación (con historial de cambios)
   */
  async update(
    id: string,
    updateDto: UpdateDocumentationDto,
    userId: string,
  ): Promise<Documentation> {
    const documentation = await this.documentationRepository.findOne({
      where: { id },
    });

    if (!documentation) {
      throw new NotFoundException(`Documentación con ID ${id} no encontrada`);
    }

    // Crear historial de cambios
    const changes: any[] = documentation.changeHistory || [];
    const now = new Date().toISOString();

    // Detectar cambios en campos específicos
    if (
      updateDto.preoperativeNotes !== undefined &&
      updateDto.preoperativeNotes !== documentation.preoperativeNotes
    ) {
      changes.push({
        timestamp: now,
        userId,
        field: 'preoperativeNotes',
        oldValue: documentation.preoperativeNotes,
        newValue: updateDto.preoperativeNotes,
      });
    }

    if (
      updateDto.intraoperativeNotes !== undefined &&
      updateDto.intraoperativeNotes !== documentation.intraoperativeNotes
    ) {
      changes.push({
        timestamp: now,
        userId,
        field: 'intraoperativeNotes',
        oldValue: documentation.intraoperativeNotes,
        newValue: updateDto.intraoperativeNotes,
      });
    }

    if (
      updateDto.postoperativeNotes !== undefined &&
      updateDto.postoperativeNotes !== documentation.postoperativeNotes
    ) {
      changes.push({
        timestamp: now,
        userId,
        field: 'postoperativeNotes',
        oldValue: documentation.postoperativeNotes,
        newValue: updateDto.postoperativeNotes,
      });
    }

    // Actualizar campos
    Object.assign(documentation, {
      ...updateDto,
      lastModifiedBy: userId,
      lastSavedAt: new Date(),
      changeHistory: changes,
    });

    const updated = await this.documentationRepository.save(documentation);
    await this.saveDocumentationVersion(updated, userId);
    this.logger.log(`Documentación actualizada: ${id}`);

    return updated;
  }

  /**
   * Guardar snapshot en el historial de versiones
   */
  private async saveDocumentationVersion(
    documentation: Documentation,
    userId?: string | null,
  ): Promise<void> {
    const count = await this.documentationVersionRepository.count({
      where: { documentationId: documentation.id },
    });
    const version = this.documentationVersionRepository.create({
      documentationId: documentation.id,
      versionNumber: count + 1,
      preoperativeNotes: documentation.preoperativeNotes ?? null,
      intraoperativeNotes: documentation.intraoperativeNotes ?? null,
      postoperativeNotes: documentation.postoperativeNotes ?? null,
      procedureDetails: documentation.procedureDetails
        ? JSON.parse(JSON.stringify(documentation.procedureDetails))
        : null,
      statusSnapshot: documentation.status ?? DocumentationStatus.DRAFT,
      createdBy: userId ?? null,
    });
    await this.documentationVersionRepository.save(version);
    this.logger.debug(`Versión ${count + 1} guardada para documentación ${documentation.id}`);
  }

  /**
   * Obtener historial de versiones (snapshots) de una documentación, más reciente primero
   */
  async getVersionHistory(id: string): Promise<DocumentationVersion[]> {
    const documentation = await this.documentationRepository.findOne({
      where: { id },
    });
    if (!documentation) {
      throw new NotFoundException(`Documentación con ID ${id} no encontrada`);
    }
    return this.documentationVersionRepository.find({
      where: { documentationId: id },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Actualizar campo específico en tiempo real (para WebSockets)
   */
  async updateField(
    id: string,
    field: string,
    value: any,
    userId: string,
  ): Promise<Documentation> {
    const documentation = await this.documentationRepository.findOne({
      where: { id },
    });

    if (!documentation) {
      throw new NotFoundException(`Documentación con ID ${id} no encontrada`);
    }

    // Validar campo
    const allowedFields = [
      'preoperativeNotes',
      'intraoperativeNotes',
      'postoperativeNotes',
      'procedureDetails',
      'status',
    ];

    if (!allowedFields.includes(field)) {
      throw new BadRequestException(`Campo ${field} no es válido para actualización`);
    }

    // Crear entrada en historial
    const changes = documentation.changeHistory || [];
    const oldValue = documentation[field];
    
    changes.push({
      timestamp: new Date().toISOString(),
      userId,
      field,
      oldValue: oldValue ? JSON.stringify(oldValue) : null,
      newValue: typeof value === 'object' ? JSON.stringify(value) : value,
    });

    // Actualizar campo
    documentation[field] = value;
    documentation.lastModifiedBy = userId;
    documentation.lastSavedAt = new Date();
    documentation.changeHistory = changes;

    const updated = await this.documentationRepository.save(documentation);
    await this.saveDocumentationVersion(updated, userId);
    this.logger.log(`Campo ${field} actualizado en documentación ${id}`);

    return updated;
  }

  /**
   * Obtener historial de cambios (campo a campo)
   */
  async getChangeHistory(id: string): Promise<any[]> {
    const documentation = await this.documentationRepository.findOne({
      where: { id },
    });

    if (!documentation) {
      throw new NotFoundException(`Documentación con ID ${id} no encontrada`);
    }

    return documentation.changeHistory || [];
  }

  /**
   * Marcar documentación como completada
   */
  async complete(id: string, userId: string): Promise<Documentation> {
    const documentation = await this.documentationRepository.findOne({
      where: { id },
    });

    if (!documentation) {
      throw new NotFoundException(`Documentación con ID ${id} no encontrada`);
    }

    documentation.status = DocumentationStatus.COMPLETED;
    documentation.lastModifiedBy = userId;
    documentation.lastSavedAt = new Date();

    const updated = await this.documentationRepository.save(documentation);
    this.logger.log(`Documentación completada: ${id}`);

    return updated;
  }

  /**
   * Auto-guardado (llamado periódicamente desde WebSocket)
   */
  async autoSave(id: string, data: Partial<UpdateDocumentationDto>): Promise<void> {
    const documentation = await this.documentationRepository.findOne({
      where: { id },
    });

    if (!documentation) {
      this.logger.warn(`Intento de auto-guardado en documentación inexistente: ${id}`);
      return;
    }

    Object.assign(documentation, {
      ...data,
      lastSavedAt: new Date(),
    });

    await this.documentationRepository.save(documentation);
    this.logger.debug(`Auto-guardado completado para documentación ${id}`);
  }
}
