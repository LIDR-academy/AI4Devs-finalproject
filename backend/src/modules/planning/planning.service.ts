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
  ) {}

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

    const surgery = this.surgeryRepository.create({
      ...createSurgeryDto,
      surgeonId,
      scheduledDate: createSurgeryDto.scheduledDate
        ? new Date(createSurgeryDto.scheduledDate)
        : null,
      status: SurgeryStatus.PLANNED,
    });

    const savedSurgery = await this.surgeryRepository.save(surgery);

    this.logger.log(`Cirugía creada: ${savedSurgery.id} por cirujano ${surgeonId}`);

    return savedSurgery;
  }

  /**
   * Obtener cirugía por ID
   */
  async findSurgeryById(id: string): Promise<Surgery> {
    const surgery = await this.surgeryRepository.findOne({
      where: { id },
      relations: ['patient', 'planning', 'planning.dicomImages', 'checklist'],
    });

    if (!surgery) {
      throw new NotFoundException(`Cirugía con ID ${id} no encontrada`);
    }

    return surgery;
  }

  /**
   * Listar cirugías con filtros
   */
  async findSurgeries(filters?: {
    patientId?: string;
    surgeonId?: string;
    status?: SurgeryStatus;
    type?: string;
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

    queryBuilder
      .leftJoinAndSelect('surgery.patient', 'patient')
      .leftJoinAndSelect('surgery.planning', 'planning')
      .orderBy('surgery.scheduledDate', 'DESC');

    return queryBuilder.getMany();
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
   */
  async getPlanningBySurgeryId(surgeryId: string): Promise<SurgicalPlanning> {
    const planning = await this.planningRepository.findOne({
      where: { surgeryId },
      relations: ['dicomImages', 'surgery'],
    });

    if (!planning) {
      throw new NotFoundException(
        `Planificación para cirugía ${surgeryId} no encontrada`,
      );
    }

    return planning;
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

    Object.assign(surgery, {
      patientId: updateSurgeryDto.patientId ?? surgery.patientId,
      procedure: updateSurgeryDto.procedure ?? surgery.procedure,
      type: updateSurgeryDto.type ?? surgery.type,
      scheduledDate: updateSurgeryDto.scheduledDate
        ? new Date(updateSurgeryDto.scheduledDate)
        : surgery.scheduledDate,
      operatingRoomId: updateSurgeryDto.operatingRoomId ?? surgery.operatingRoomId,
      preopNotes: updateSurgeryDto.preopNotes ?? surgery.preopNotes,
      riskScores: updateSurgeryDto.riskScores ?? surgery.riskScores,
    });

    const updatedSurgery = await this.surgeryRepository.save(surgery);
    this.logger.log(`Cirugía actualizada: ${surgeryId}`);

    return updatedSurgery;
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
