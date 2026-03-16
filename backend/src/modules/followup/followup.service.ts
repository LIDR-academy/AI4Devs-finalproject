import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostopEvolution } from './entities/postop-evolution.entity';
import { DischargePlan } from './entities/discharge-plan.entity';
import { Surgery } from '../planning/entities/surgery.entity';
import { CreateEvolutionDto } from './dto/create-evolution.dto';
import { CreateDischargePlanDto } from './dto/create-discharge-plan.dto';
import { PdfGeneratorService } from './services/pdf-generator.service';

@Injectable()
export class FollowupService {
  private readonly logger = new Logger(FollowupService.name);

  constructor(
    @InjectRepository(PostopEvolution)
    private readonly evolutionRepository: Repository<PostopEvolution>,
    @InjectRepository(DischargePlan)
    private readonly dischargePlanRepository: Repository<DischargePlan>,
    @InjectRepository(Surgery)
    private readonly surgeryRepository: Repository<Surgery>,
    private readonly pdfGeneratorService: PdfGeneratorService,
  ) {}

  private async findSurgeryOrFail(surgeryId: string): Promise<Surgery> {
    const surgery = await this.surgeryRepository.findOne({
      where: { id: surgeryId },
      relations: ['patient'],
    });
    if (!surgery) {
      throw new NotFoundException(`Cirugía ${surgeryId} no encontrada`);
    }
    return surgery;
  }

  async createEvolution(dto: CreateEvolutionDto, userId: string): Promise<PostopEvolution> {
    await this.findSurgeryOrFail(dto.surgeryId);
    // Usar mediodía UTC para que la fecha no cambie por zona horaria (YYYY-MM-DD → DATE)
    const evolutionDate =
      typeof dto.evolutionDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dto.evolutionDate)
        ? new Date(dto.evolutionDate + 'T12:00:00.000Z')
        : new Date(dto.evolutionDate);
    const evolution = this.evolutionRepository.create({
      ...dto,
      evolutionDate,
      recordedBy: userId,
    });
    const saved = await this.evolutionRepository.save(evolution);
    this.logger.log(`Evolución creada: ${saved.id} para cirugía ${dto.surgeryId}`);
    return saved;
  }

  async getEvolutionsBySurgery(surgeryId: string): Promise<PostopEvolution[]> {
    await this.findSurgeryOrFail(surgeryId);
    return this.evolutionRepository.find({
      where: { surgeryId },
      order: { evolutionDate: 'DESC', createdAt: 'DESC' },
    });
  }

  async getEvolutionById(id: string): Promise<PostopEvolution> {
    const evolution = await this.evolutionRepository.findOne({
      where: { id },
      relations: ['surgery'],
    });
    if (!evolution) {
      throw new NotFoundException(`Evolución ${id} no encontrada`);
    }
    return evolution;
  }

  async getComplicationsAlerts(surgeryId: string): Promise<PostopEvolution[]> {
    await this.findSurgeryOrFail(surgeryId);
    return this.evolutionRepository.find({
      where: { surgeryId, hasComplications: true },
      order: { evolutionDate: 'DESC' },
    });
  }

  async createOrUpdateDischargePlan(
    surgeryId: string,
    dto: CreateDischargePlanDto,
    userId: string,
  ): Promise<DischargePlan> {
    const surgery = await this.findSurgeryOrFail(surgeryId);
    let plan = await this.dischargePlanRepository.findOne({
      where: { surgeryId },
    });
    if (plan) {
      Object.assign(plan, dto);
      plan.generatedBy = userId;
    } else {
      plan = this.dischargePlanRepository.create({
        surgeryId,
        ...dto,
        generatedBy: userId,
        surgerySummary: dto.surgerySummary ?? `Procedimiento: ${surgery.procedure}. Fecha: ${surgery.scheduledDate ? new Date(surgery.scheduledDate).toLocaleDateString() : 'N/A'}.`,
      });
    }
    const saved = await this.dischargePlanRepository.save(plan);
    this.logger.log(`Plan de alta ${plan.id ? 'actualizado' : 'creado'} para cirugía ${surgeryId}`);
    return saved;
  }

  async getDischargePlanBySurgery(surgeryId: string): Promise<DischargePlan | null> {
    await this.findSurgeryOrFail(surgeryId);
    return this.dischargePlanRepository.findOne({
      where: { surgeryId },
      relations: ['surgery', 'surgery.patient'],
    });
  }

  async finalizeDischargePlan(surgeryId: string, userId: string): Promise<DischargePlan> {
    const plan = await this.dischargePlanRepository.findOne({
      where: { surgeryId },
    });
    if (!plan) {
      throw new NotFoundException(`No existe plan de alta para la cirugía ${surgeryId}`);
    }
    plan.status = 'finalized';
    plan.generatedBy = userId;
    return this.dischargePlanRepository.save(plan);
  }

  async generateDischargePlanFromSurgery(surgeryId: string, userId: string): Promise<DischargePlan> {
    const surgery = await this.surgeryRepository.findOne({
      where: { id: surgeryId },
      relations: ['patient'],
    });
    if (!surgery) {
      throw new NotFoundException(`Cirugía ${surgeryId} no encontrada`);
    }
    const existing = await this.dischargePlanRepository.findOne({
      where: { surgeryId },
    });
    if (existing) {
      return existing;
    }
    const plan = this.dischargePlanRepository.create({
      surgeryId,
      surgerySummary: `Procedimiento: ${surgery.procedure}. Paciente dado de alta según evolución.`,
      instructions: 'Seguir controles según indicación médica. Acudir a urgencias ante fiebre, sangrado o dolor intenso.',
      generatedBy: userId,
      status: 'draft',
    });
    return this.dischargePlanRepository.save(plan);
  }

  async getDischargePlanPdfBuffer(surgeryId: string): Promise<Buffer> {
    const plan = await this.dischargePlanRepository.findOne({
      where: { surgeryId },
      relations: ['surgery', 'surgery.patient'],
    });
    if (!plan) {
      throw new NotFoundException(`No existe plan de alta para la cirugía ${surgeryId}`);
    }
    return this.pdfGeneratorService.generateDischargePlanPdf(plan);
  }
}
