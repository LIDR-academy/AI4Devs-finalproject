import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Checklist, ChecklistPhase } from '../entities/checklist.entity';
import { Surgery } from '../entities/surgery.entity';

@Injectable()
export class ChecklistService {
  private readonly logger = new Logger(ChecklistService.name);

  constructor(
    @InjectRepository(Checklist)
    private checklistRepository: Repository<Checklist>,
    @InjectRepository(Surgery)
    private surgeryRepository: Repository<Surgery>,
  ) {}

  /**
   * Crear checklist para una cirugía
   */
  async createChecklist(surgeryId: string): Promise<Checklist> {
    const surgery = await this.surgeryRepository.findOne({
      where: { id: surgeryId },
    });

    if (!surgery) {
      throw new NotFoundException(`Cirugía con ID ${surgeryId} no encontrada`);
    }

    // Verificar si ya existe un checklist
    const existingChecklist = await this.checklistRepository.findOne({
      where: { surgeryId },
    });

    if (existingChecklist) {
      return existingChecklist;
    }

    // Crear checklist con estructura WHO estándar
    const checklistData = this.getDefaultChecklistData();

    const checklist = this.checklistRepository.create({
      surgeryId,
      checklistData,
    });

    return this.checklistRepository.save(checklist);
  }

  /**
   * Obtener checklist de una cirugía
   */
  async getChecklist(surgeryId: string): Promise<Checklist> {
    const checklist = await this.checklistRepository.findOne({
      where: { surgeryId },
      relations: ['surgery'],
    });

    if (!checklist) {
      // Crear automáticamente si no existe
      return this.createChecklist(surgeryId);
    }

    return checklist;
  }

  /**
   * Actualizar fase del checklist
   */
  async updateChecklistPhase(
    surgeryId: string,
    phase: 'preInduction' | 'preIncision' | 'postProcedure',
    phaseData: ChecklistPhase,
    userId: string,
  ): Promise<Checklist> {
    const checklist = await this.getChecklist(surgeryId);

    // Actualizar datos de la fase
    checklist.checklistData[phase] = {
      ...phaseData,
      completed: phaseData.items.every((item) => item.checked),
      completedBy: phaseData.items.every((item) => item.checked) ? userId : undefined,
      completedAt: phaseData.items.every((item) => item.checked) ? new Date() : undefined,
    };

    // Actualizar flags de completitud
    if (phase === 'preInduction') {
      checklist.preInductionComplete = checklist.checklistData.preInduction?.completed || false;
    } else if (phase === 'preIncision') {
      checklist.preIncisionComplete = checklist.checklistData.preIncision?.completed || false;
    } else if (phase === 'postProcedure') {
      checklist.postProcedureComplete = checklist.checklistData.postProcedure?.completed || false;
    }

    // Verificar si todas las fases están completas
    if (
      checklist.preInductionComplete &&
      checklist.preIncisionComplete &&
      checklist.postProcedureComplete
    ) {
      checklist.completedAt = new Date();
    }

    return this.checklistRepository.save(checklist);
  }

  /**
   * Marcar/desmarcar ítem específico
   */
  async toggleChecklistItem(
    surgeryId: string,
    phase: 'preInduction' | 'preIncision' | 'postProcedure',
    itemId: string,
    checked: boolean,
    userId: string,
    notes?: string,
  ): Promise<Checklist> {
    const checklist = await this.getChecklist(surgeryId);

    const phaseData = checklist.checklistData[phase];
    if (!phaseData) {
      throw new BadRequestException(`Fase ${phase} no encontrada en el checklist`);
    }

    const item = phaseData.items.find((i) => i.id === itemId);
    if (!item) {
      throw new NotFoundException(`Ítem ${itemId} no encontrado en la fase ${phase}`);
    }

    item.checked = checked;
    if (checked) {
      item.checkedBy = userId;
      item.checkedAt = new Date();
    } else {
      item.checkedBy = undefined;
      item.checkedAt = undefined;
    }
    if (notes !== undefined) {
      item.notes = notes;
    }

    // Actualizar completitud de la fase
    phaseData.completed = phaseData.items.every((i) => i.checked);
    if (phaseData.completed) {
      phaseData.completedBy = userId;
      phaseData.completedAt = new Date();
    }

    // Actualizar flags
    if (phase === 'preInduction') {
      checklist.preInductionComplete = phaseData.completed;
    } else if (phase === 'preIncision') {
      checklist.preIncisionComplete = phaseData.completed;
    } else if (phase === 'postProcedure') {
      checklist.postProcedureComplete = phaseData.completed;
    }

    // Verificar si todas las fases están completas
    if (
      checklist.preInductionComplete &&
      checklist.preIncisionComplete &&
      checklist.postProcedureComplete
    ) {
      checklist.completedAt = new Date();
    }

    return this.checklistRepository.save(checklist);
  }

  /**
   * Obtener estructura de checklist WHO por defecto
   */
  private getDefaultChecklistData(): Checklist['checklistData'] {
    return {
      preInduction: {
        name: 'Pre-Inducción',
        items: [
          {
            id: 'pre-1',
            text: 'Confirmar identidad del paciente',
            checked: false,
          },
          {
            id: 'pre-2',
            text: 'Confirmar sitio quirúrgico, procedimiento y consentimiento',
            checked: false,
          },
          {
            id: 'pre-3',
            text: 'Verificar marcado del sitio quirúrgico',
            checked: false,
          },
          {
            id: 'pre-4',
            text: 'Verificar que el equipo de anestesia ha completado su evaluación',
            checked: false,
          },
          {
            id: 'pre-5',
            text: 'Verificar que el pulso oximétro está funcionando',
            checked: false,
          },
        ],
        completed: false,
      },
      preIncision: {
        name: 'Pre-Incisión',
        items: [
          {
            id: 'incision-1',
            text: 'Confirmar identidad del paciente',
            checked: false,
          },
          {
            id: 'incision-2',
            text: 'Confirmar sitio quirúrgico',
            checked: false,
          },
          {
            id: 'incision-3',
            text: 'Confirmar procedimiento',
            checked: false,
          },
          {
            id: 'incision-4',
            text: 'Anticipar eventos críticos',
            checked: false,
          },
          {
            id: 'incision-5',
            text: 'Revisar alergias conocidas',
            checked: false,
          },
          {
            id: 'incision-6',
            text: 'Verificar disponibilidad de sangre y productos sanguíneos',
            checked: false,
          },
        ],
        completed: false,
      },
      postProcedure: {
        name: 'Post-Procedimiento',
        items: [
          {
            id: 'post-1',
            text: 'Confirmar nombre del procedimiento realizado',
            checked: false,
          },
          {
            id: 'post-2',
            text: 'Verificar conteo de instrumentos, esponjas y agujas',
            checked: false,
          },
          {
            id: 'post-3',
            text: 'Identificar cualquier problema con equipamiento',
            checked: false,
          },
          {
            id: 'post-4',
            text: 'Revisar preocupaciones clave para recuperación',
            checked: false,
          },
        ],
        completed: false,
      },
    };
  }
}
