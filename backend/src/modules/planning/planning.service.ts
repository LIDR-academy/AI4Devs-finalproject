import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Surgery, SurgeryStatus } from './entities/surgery.entity';
import { SurgicalPlanning } from './entities/surgical-planning.entity';
import { DicomImage } from './entities/dicom-image.entity';
import { Patient } from '../hce/entities/patient.entity';
import { CreateSurgeryDto } from './dto/create-surgery.dto';
import { UpdateSurgeryDto } from './dto/update-surgery.dto';
import { CreatePlanningDto } from './dto/create-planning.dto';
import { MetricsService } from '../monitoring/metrics.service';

/** Dos intervalos [a1,a2] y [b1,b2] se solapan si a1 < b2 y b1 < a2 */
function intervalsOverlap(
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date,
): boolean {
  return startA.getTime() < endB.getTime() && endA.getTime() > startB.getTime();
}

@Injectable()
export class PlanningService {
  private readonly logger = new Logger(PlanningService.name);

  constructor(
    @InjectRepository(Surgery)
    private surgeryRepository: Repository<Surgery>,
    @InjectRepository(SurgicalPlanning)
    private planningRepository: Repository<SurgicalPlanning>,
    @InjectRepository(DicomImage)
    private dicomImageRepository: Repository<DicomImage>,
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    private metricsService: MetricsService,
  ) {}

  /**
   * Comprueba si hay conflicto de horario en el quirófano (excluye cirugías canceladas y opcionalmente una cirugía por ID).
   */
  private async checkRoomScheduleConflict(
    operatingRoomId: string,
    start: Date,
    end: Date,
    excludeSurgeryId?: string,
  ): Promise<void> {
    const qb = this.surgeryRepository
      .createQueryBuilder('s')
      .where('s.operating_room_id = :roomId', { roomId: operatingRoomId })
      .andWhere('s.status != :cancelled', { cancelled: SurgeryStatus.CANCELLED })
      .andWhere('s.start_time IS NOT NULL AND s.end_time IS NOT NULL');

    if (excludeSurgeryId) {
      qb.andWhere('s.id != :excludeId', { excludeId: excludeSurgeryId });
    }

    const existing = await qb.getMany();

    for (const s of existing) {
      const sStart = s.startTime instanceof Date ? s.startTime : new Date(s.startTime);
      const sEnd = s.endTime instanceof Date ? s.endTime : new Date(s.endTime);
      if (intervalsOverlap(start, end, sStart, sEnd)) {
        throw new BadRequestException(
          `Conflicto de horario en el quirófano: ya existe una cirugía programada entre ${sStart.toISOString()} y ${sEnd.toISOString()}. Elija otro horario o quirófano.`,
        );
      }
    }
  }

  /**
   * Crear nueva cirugía
   */
  async createSurgery(
    createSurgeryDto: CreateSurgeryDto,
    surgeonId: string,
  ): Promise<Surgery> {
    // Verificar que el paciente existe
    const patient = await this.patientRepository.findOne({
      where: { id: createSurgeryDto.patientId },
    });

    if (!patient) {
      throw new NotFoundException(
        `Paciente con ID ${createSurgeryDto.patientId} no encontrado`,
      );
    }

    const startTime = createSurgeryDto.startTime
      ? new Date(createSurgeryDto.startTime)
      : null;
    const endTime = createSurgeryDto.endTime
      ? new Date(createSurgeryDto.endTime)
      : null;

    if (
      createSurgeryDto.operatingRoomId &&
      startTime &&
      endTime &&
      endTime.getTime() <= startTime.getTime()
    ) {
      throw new BadRequestException(
        'La hora de fin debe ser posterior a la hora de inicio.',
      );
    }

    if (createSurgeryDto.operatingRoomId && startTime && endTime) {
      await this.checkRoomScheduleConflict(
        createSurgeryDto.operatingRoomId,
        startTime,
        endTime,
      );
    }

    const surgery = this.surgeryRepository.create({
      ...createSurgeryDto,
      surgeonId,
      scheduledDate: createSurgeryDto.scheduledDate
        ? new Date(createSurgeryDto.scheduledDate)
        : null,
      startTime,
      endTime,
      status: SurgeryStatus.PLANNED,
    });

    const savedSurgery = await this.surgeryRepository.save(surgery);

    this.logger.log(`Cirugía creada: ${savedSurgery.id} por cirujano ${surgeonId}`);
    this.metricsService.recordSurgeryCreated(savedSurgery.type || 'unknown', savedSurgery.status);
    return savedSurgery;
  }

  /**
   * Obtener cirugía por ID
   */
  async findSurgeryById(id: string): Promise<Surgery> {
    const surgery = await this.surgeryRepository.findOne({
      where: { id },
      relations: ['patient', 'planning', 'planning.dicomImages', 'checklist', 'operatingRoom'],
    });

    if (!surgery) {
      throw new NotFoundException(`Cirugía con ID ${id} no encontrada`);
    }

    return surgery;
  }

  /**
   * Obtener ocupación de un quirófano en un rango de fechas (para calendario).
   * Incluye:
   * - Cirugías con start_time y end_time que solapan el rango.
   * - Cirugías con solo scheduled_date cuyo día cae dentro del rango (para mostrar ocupación aunque no tengan ventana horaria).
   */
  async getRoomAvailability(
    operatingRoomId: string,
    from: Date,
    to: Date,
  ): Promise<Surgery[]> {
    const qb = this.surgeryRepository
      .createQueryBuilder('s')
      .where('s.operating_room_id = :roomId', { roomId: operatingRoomId })
      .andWhere('s.status != :cancelled', { cancelled: SurgeryStatus.CANCELLED })
      .andWhere(
        `(
          (s.startTime IS NOT NULL AND s.endTime IS NOT NULL AND s.startTime < :toDate AND s.endTime > :fromDate)
          OR
          (s.scheduledDate IS NOT NULL AND s.scheduledDate >= :fromDate AND s.scheduledDate <= :toDate)
        )`,
        { fromDate: from, toDate: to },
      )
      .leftJoinAndSelect('s.patient', 'patient')
      .orderBy('COALESCE(s.startTime, s.scheduledDate)', 'ASC');

    return qb.getMany();
  }

  /**
   * Listar cirugías con filtros
   */
  async findSurgeries(filters?: {
    patientId?: string;
    surgeonId?: string;
    status?: SurgeryStatus;
    type?: string;
    operatingRoomId?: string;
    from?: string;
    to?: string;
  }): Promise<Surgery[]> {
    const queryBuilder = this.surgeryRepository.createQueryBuilder('surgery');

    if (filters?.patientId) {
      queryBuilder.where('surgery.patientId = :patientId', {
        patientId: filters.patientId,
      });
    }

    if (filters?.surgeonId) {
      queryBuilder.andWhere('surgery.surgeonId = :surgeonId', {
        surgeonId: filters.surgeonId,
      });
    }

    if (filters?.status) {
      queryBuilder.andWhere('surgery.status = :status', { status: filters.status });
    }

    if (filters?.type) {
      queryBuilder.andWhere('surgery.type = :type', { type: filters.type });
    }

    if (filters?.operatingRoomId) {
      queryBuilder.andWhere('surgery.operating_room_id = :operatingRoomId', {
        operatingRoomId: filters.operatingRoomId,
      });
    }

    if (filters?.from) {
      queryBuilder.andWhere('surgery.scheduled_date >= :from', {
        from: filters.from,
      });
    }

    if (filters?.to) {
      queryBuilder.andWhere('surgery.scheduled_date <= :to', {
        to: filters.to,
      });
    }

    queryBuilder
      .leftJoinAndSelect('surgery.patient', 'patient')
      .leftJoinAndSelect('surgery.planning', 'planning')
      .leftJoinAndSelect('surgery.checklist', 'checklist')
      .orderBy('surgery.createdAt', 'DESC')
      .addOrderBy('surgery.scheduledDate', 'DESC', 'NULLS LAST');

    const surgeries = await queryBuilder.getMany();
    this.logger.log(`Se encontraron ${surgeries.length} cirugías con los filtros aplicados`);
    return surgeries;
  }

  /**
   * Crear planificación quirúrgica
   */
  async createPlanning(
    createPlanningDto: CreatePlanningDto,
    userId: string,
  ): Promise<SurgicalPlanning> {
    const surgery = await this.findSurgeryById(createPlanningDto.surgeryId);

    // Verificar si ya existe una planificación
    const existingPlanning = await this.planningRepository.findOne({
      where: { surgeryId: surgery.id },
    });

    if (existingPlanning) {
      throw new BadRequestException(
        'Ya existe una planificación para esta cirugía',
      );
    }

    const planning = this.planningRepository.create({
      surgeryId: surgery.id,
      approachSelected: createPlanningDto.approachSelected,
      analysisData: createPlanningDto.analysisData,
      simulationData: createPlanningDto.simulationData,
      planningNotes: createPlanningDto.planningNotes,
    });

    const savedPlanning = await this.planningRepository.save(planning);

    // Asociar imágenes DICOM si se proporcionan
    if (createPlanningDto.dicomImageIds && createPlanningDto.dicomImageIds.length > 0) {
      await this.associateDicomImages(savedPlanning.id, createPlanningDto.dicomImageIds);
    }

    this.logger.log(
      `Planificación creada: ${savedPlanning.id} para cirugía ${surgery.id}`,
    );

    return savedPlanning;
  }

  /**
   * Actualizar planificación quirúrgica
   */
  async updatePlanning(
    planningId: string,
    updateData: Partial<CreatePlanningDto>,
  ): Promise<SurgicalPlanning> {
    const planning = await this.planningRepository.findOne({
      where: { id: planningId },
    });

    if (!planning) {
      throw new NotFoundException(`Planificación con ID ${planningId} no encontrada`);
    }

    Object.assign(planning, {
      approachSelected: updateData.approachSelected ?? planning.approachSelected,
      analysisData: updateData.analysisData ?? planning.analysisData,
      simulationData: updateData.simulationData ?? planning.simulationData,
      planningNotes: updateData.planningNotes ?? planning.planningNotes,
    });

    return this.planningRepository.save(planning);
  }

  /**
   * Obtener planificación por ID de cirugía
   * Retorna null si no existe (no lanza error 404)
   */
  async getPlanningBySurgeryId(surgeryId: string): Promise<SurgicalPlanning | null> {
    const planning = await this.planningRepository.findOne({
      where: { surgeryId },
      relations: ['dicomImages', 'surgery'],
    });

    // Retornar null en lugar de lanzar error cuando no existe
    return planning || null;
  }

  /**
   * Asociar imágenes DICOM a planificación
   */
  async associateDicomImages(
    planningId: string,
    orthancInstanceIds: string[],
  ): Promise<DicomImage[]> {
    const planning = await this.planningRepository.findOne({
      where: { id: planningId },
    });

    if (!planning) {
      throw new NotFoundException(`Planificación con ID ${planningId} no encontrada`);
    }

    const dicomImages: DicomImage[] = [];

    for (const instanceId of orthancInstanceIds) {
      try {
        // Crear entrada básica con el ID de instancia de Orthanc
        // La información detallada se puede obtener después si es necesario
        const dicomImage = this.dicomImageRepository.create({
          planningId: planning.id,
          orthancInstanceId: instanceId,
          metadata: {
            instanceId: instanceId,
          },
        });

        dicomImages.push(await this.dicomImageRepository.save(dicomImage));
      } catch (error) {
        this.logger.error(
          `Error asociando imagen DICOM ${instanceId}: ${error.message}`,
        );
        throw error;
      }
    }

    return dicomImages;
  }

  /**
   * Calcular score de riesgo para cirugía
   */
  async calculateRiskScore(surgeryId: string): Promise<{
    asa?: number;
    possum?: number;
    custom?: number;
  }> {
    const surgery = await this.findSurgeryById(surgeryId);

    // Aquí se implementaría la lógica de cálculo de scores
    // Por ahora, retornamos valores por defecto o existentes
    return surgery.riskScores || {
      asa: 2, // Valor por defecto
      possum: 15, // Valor por defecto
    };
  }

  /**
   * Actualizar cirugía
   */
  async updateSurgery(
    surgeryId: string,
    updateSurgeryDto: UpdateSurgeryDto,
  ): Promise<Surgery> {
    const surgery = await this.findSurgeryById(surgeryId);

    // Verificar que el paciente existe si se actualiza
    if (updateSurgeryDto.patientId && updateSurgeryDto.patientId !== surgery.patientId) {
      const patient = await this.patientRepository.findOne({
        where: { id: updateSurgeryDto.patientId },
      });

      if (!patient) {
        throw new NotFoundException(
          `Paciente con ID ${updateSurgeryDto.patientId} no encontrado`,
        );
      }
    }

    const newStart = updateSurgeryDto.startTime
      ? new Date(updateSurgeryDto.startTime)
      : surgery.startTime;
    const newEnd = updateSurgeryDto.endTime
      ? new Date(updateSurgeryDto.endTime)
      : surgery.endTime;
    const newRoomId = updateSurgeryDto.operatingRoomId ?? surgery.operatingRoomId;

    if (newRoomId && newStart && newEnd) {
      if (newEnd.getTime() <= newStart.getTime()) {
        throw new BadRequestException(
          'La hora de fin debe ser posterior a la hora de inicio.',
        );
      }
      await this.checkRoomScheduleConflict(
        newRoomId,
        newStart,
        newEnd,
        surgeryId,
      );
    }

    Object.assign(surgery, {
      patientId: updateSurgeryDto.patientId ?? surgery.patientId,
      procedure: updateSurgeryDto.procedure ?? surgery.procedure,
      type: updateSurgeryDto.type ?? surgery.type,
      scheduledDate: updateSurgeryDto.scheduledDate
        ? new Date(updateSurgeryDto.scheduledDate)
        : surgery.scheduledDate,
      startTime: newStart,
      endTime: newEnd,
      operatingRoomId: newRoomId,
      preopNotes: updateSurgeryDto.preopNotes ?? surgery.preopNotes,
      riskScores: updateSurgeryDto.riskScores ?? surgery.riskScores,
    });

    const updatedSurgery = await this.surgeryRepository.save(surgery);
    this.logger.log(`Cirugía actualizada: ${surgeryId}`);

    return updatedSurgery;
  }

  /**
   * Generar guía quirúrgica a partir de cirugía y planificación (procedimiento, abordaje, pasos, riesgo).
   */
  async getSurgicalGuide(surgeryId: string): Promise<{
    surgeryId: string;
    procedure: string;
    type: string | null;
    approach: string | null;
    steps: string[];
    riskScores: Record<string, number> | null;
    planningNotes: string | null;
    dicomImageCount: number;
    estimatedDurationMinutes: number | null;
  }> {
    const surgery = await this.findSurgeryById(surgeryId);
    const planning = await this.getPlanningBySurgeryId(surgeryId);

    const procedure = surgery.procedure || 'Procedimiento no especificado';
    const approach = planning?.approachSelected ?? null;
    const planningNotes = planning?.planningNotes ?? null;
    const riskScores = surgery.riskScores && typeof surgery.riskScores === 'object'
      ? (surgery.riskScores as Record<string, number>)
      : null;

    const steps: string[] = [
      '1. Verificación preoperatoria y checklist WHO',
      '2. Posicionamiento del paciente según abordaje',
      approach ? `3. Abordaje: ${approach}` : '3. Abordaje según planificación',
      '4. Procedimiento principal',
      '5. Cierre y verificación de contaje',
      '6. Despertar y traslado a recuperación',
    ];

    const dicomImageCount = planning?.dicomImages?.length ?? 0;
    const estimatedDurationMinutes = planning?.simulationData?.estimatedDuration ?? null;

    return {
      surgeryId,
      procedure,
      type: surgery.type ?? null,
      approach,
      steps,
      riskScores,
      planningNotes,
      dicomImageCount,
      estimatedDurationMinutes,
    };
  }

  /**
   * Actualizar estado de cirugía
   */
  async updateSurgeryStatus(
    surgeryId: string,
    status: SurgeryStatus,
  ): Promise<Surgery> {
    const surgery = await this.findSurgeryById(surgeryId);

    surgery.status = status;

    if (status === SurgeryStatus.IN_PROGRESS && !surgery.startTime) {
      surgery.startTime = new Date();
    }

    if (status === SurgeryStatus.COMPLETED && !surgery.endTime) {
      surgery.endTime = new Date();
    }

    return this.surgeryRepository.save(surgery);
  }
}
