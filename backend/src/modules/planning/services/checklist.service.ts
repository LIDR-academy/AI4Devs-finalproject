import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Checklist, ChecklistPhase } from '../entities/checklist.entity';
import { ChecklistVersion } from '../entities/checklist-version.entity';
import { Surgery } from '../entities/surgery.entity';

type ChecklistPhaseType = 'preInduction' | 'preIncision' | 'postProcedure';

@Injectable()
export class ChecklistService {
  private readonly logger = new Logger(ChecklistService.name);

  constructor(
    @InjectRepository(Checklist)
    private checklistRepository: Repository<Checklist>,
    @InjectRepository(ChecklistVersion)
    private checklistVersionRepository: Repository<ChecklistVersion>,
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
    const updatedPhase = {
      ...phaseData,
      completed: phaseData.items.every((item) => item.checked),
      completedBy: phaseData.items.every((item) => item.checked) ? userId : undefined,
      completedAt: phaseData.items.every((item) => item.checked) ? new Date() : undefined,
    };

    // Forzar actualización del campo JSONB creando un nuevo objeto
    checklist.checklistData = {
      ...checklist.checklistData,
      [phase]: updatedPhase,
    };

    // Actualizar flags de completitud
    if (phase === 'preInduction') {
      checklist.preInductionComplete = updatedPhase.completed || false;
    } else if (phase === 'preIncision') {
      checklist.preIncisionComplete = updatedPhase.completed || false;
    } else if (phase === 'postProcedure') {
      checklist.postProcedureComplete = updatedPhase.completed || false;
    }

    // Verificar si todas las fases están completas
    if (
      checklist.preInductionComplete &&
      checklist.preIncisionComplete &&
      checklist.postProcedureComplete
    ) {
      checklist.completedAt = new Date();
    }

    this.logger.log(`Actualizando fase ${phase} del checklist para cirugía ${surgeryId}`);
    const saved = await this.checklistRepository.save(checklist);
    await this.saveChecklistVersion(saved, phase, userId);
    this.logger.log(`Fase ${phase} actualizada exitosamente`);
    return saved;
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

    // Validación: No permitir desmarcar ítems críticos si la fase ya está completa
    if (!checked && phaseData.completed) {
      this.logger.warn(
        `Intento de desmarcar ítem ${itemId} en fase ${phase} completada para cirugía ${surgeryId}`,
      );
      // Permitir desmarcar pero marcar la fase como incompleta
      phaseData.completed = false;
      phaseData.completedBy = undefined;
      phaseData.completedAt = undefined;
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
      this.logger.log(
        `Fase ${phase} completada para cirugía ${surgeryId} por usuario ${userId}`,
      );
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
      this.logger.log(`Checklist completo para cirugía ${surgeryId}`);
    }

    // Forzar actualización del campo JSONB creando un nuevo objeto
    // TypeORM a veces no detecta cambios en objetos JSONB anidados
    checklist.checklistData = {
      ...checklist.checklistData,
      [phase]: phaseData,
    };

    this.logger.log(
      `Guardando checklist para cirugía ${surgeryId}, fase ${phase}, ítem ${itemId} marcado como ${checked}`,
    );

    const saved = await this.checklistRepository.save(checklist);
    await this.saveChecklistVersion(saved, checklist.completedAt ? 'completed' : phase, userId);
    this.logger.log(`Checklist guardado exitosamente: ${saved.id}`);
    return saved;
  }

  /**
   * Guardar snapshot en el historial de versiones
   */
  private async saveChecklistVersion(
    checklist: Checklist,
    phaseUpdated: string,
    userId: string | null,
  ): Promise<void> {
    const count = await this.checklistVersionRepository.count({
      where: { checklistId: checklist.id },
    });
    const version = this.checklistVersionRepository.create({
      checklistId: checklist.id,
      versionNumber: count + 1,
      phaseUpdated,
      checklistDataSnapshot: { ...checklist.checklistData },
      preInductionComplete: checklist.preInductionComplete,
      preIncisionComplete: checklist.preIncisionComplete,
      postProcedureComplete: checklist.postProcedureComplete,
      completedAtSnapshot: checklist.completedAt ?? null,
      createdBy: userId ?? null,
    });
    await this.checklistVersionRepository.save(version);
    this.logger.debug(`Versión ${count + 1} guardada para checklist ${checklist.id}`);
  }

  /**
   * Obtener historial de versiones del checklist de una cirugía (lista de versiones, más reciente primero)
   */
  async getChecklistHistory(surgeryId: string): Promise<ChecklistVersion[]> {
    const checklist = await this.checklistRepository.findOne({
      where: { surgeryId },
    });
    if (!checklist) {
      return [];
    }
    return this.checklistVersionRepository.find({
      where: { checklistId: checklist.id },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener ítems críticos faltantes (para alertas)
   */
  async getMissingCriticalItems(surgeryId: string): Promise<{
    phase: string;
    missingItems: string[];
  }[]> {
    const checklist = await this.getChecklist(surgeryId);
    const missing: { phase: string; missingItems: string[] }[] = [];

    const phases: Array<{ key: ChecklistPhaseType; name: string }> = [
      { key: 'preInduction', name: 'Pre-Inducción' },
      { key: 'preIncision', name: 'Pre-Incisión' },
      { key: 'postProcedure', name: 'Post-Procedimiento' },
    ];

    for (const { key, name } of phases) {
      const phaseData = checklist.checklistData[key as ChecklistPhaseType];
      if (phaseData && !phaseData.completed) {
        const uncheckedItems = phaseData.items
          .filter((item) => !item.checked)
          .map((item) => item.text);
        if (uncheckedItems.length > 0) {
          missing.push({
            phase: name,
            missingItems: uncheckedItems,
          });
        }
      }
    }

    return missing;
  }

  /**
   * Obtener estructura de checklist WHO oficial (19 ítems en 3 fases)
   * Basado en: WHO Surgical Safety Checklist Implementation Manual
   */
  private getDefaultChecklistData(): Checklist['checklistData'] {
    return {
      preInduction: {
        name: 'Sign In - Antes de la Inducción de Anestesia',
        items: [
          {
            id: 'signin-1',
            text: 'Confirmar identidad del paciente, sitio quirúrgico, procedimiento y consentimiento',
            checked: false,
          },
          {
            id: 'signin-2',
            text: 'Marcado del sitio quirúrgico (si aplica)',
            checked: false,
          },
          {
            id: 'signin-3',
            text: 'Verificar que la máquina de anestesia y medicamentos están verificados',
            checked: false,
          },
          {
            id: 'signin-4',
            text: 'Verificar que el pulso oximétro está funcionando y conectado al paciente',
            checked: false,
          },
          {
            id: 'signin-5',
            text: 'Evaluar riesgo de alergias conocidas del paciente',
            checked: false,
          },
          {
            id: 'signin-6',
            text: 'Evaluar riesgo de vía aérea/aspiración',
            checked: false,
          },
          {
            id: 'signin-7',
            text: 'Evaluar riesgo de pérdida de sangre (>500ml en adultos, >7ml/kg en niños)',
            checked: false,
          },
          {
            id: 'signin-8',
            text: 'Presentación del equipo por nombre y función',
            checked: false,
          },
        ],
        completed: false,
      },
      preIncision: {
        name: 'Time Out - Antes de la Incisión',
        items: [
          {
            id: 'timeout-1',
            text: 'Confirmar identidad del paciente',
            checked: false,
          },
          {
            id: 'timeout-2',
            text: 'Confirmar sitio quirúrgico y procedimiento',
            checked: false,
          },
          {
            id: 'timeout-3',
            text: 'Anticipar eventos críticos: Cirujano revisa planes críticos y no esperados',
            checked: false,
          },
          {
            id: 'timeout-4',
            text: 'Anticipar eventos críticos: Anestesiólogo revisa preocupaciones críticas',
            checked: false,
          },
          {
            id: 'timeout-5',
            text: 'Anticipar eventos críticos: Enfermería revisa preocupaciones críticas',
            checked: false,
          },
          {
            id: 'timeout-6',
            text: 'Verificar profilaxis antibiótica administrada en los últimos 60 minutos',
            checked: false,
          },
          {
            id: 'timeout-7',
            text: 'Confirmar que todas las imágenes y equipos esenciales están disponibles',
            checked: false,
          },
        ],
        completed: false,
      },
      postProcedure: {
        name: 'Sign Out - Antes de que el Paciente Salga del Quirófano',
        items: [
          {
            id: 'signout-1',
            text: 'Confirmar verbalmente el nombre del procedimiento realizado',
            checked: false,
          },
          {
            id: 'signout-2',
            text: 'Verificar que el conteo de instrumentos, esponjas y agujas está completo',
            checked: false,
          },
          {
            id: 'signout-3',
            text: 'Verificar que las muestras de tejido están etiquetadas correctamente',
            checked: false,
          },
          {
            id: 'signout-4',
            text: 'Identificar cualquier problema con equipamiento que deba ser abordado',
            checked: false,
          },
          {
            id: 'signout-5',
            text: 'Revisar preocupaciones clave para la recuperación y manejo del paciente',
            checked: false,
          },
        ],
        completed: false,
      },
    };
  }
}
