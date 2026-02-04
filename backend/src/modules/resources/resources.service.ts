import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Equipment } from './entities/equipment.entity';
import { StaffAssignment } from './entities/staff-assignment.entity';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { CreateStaffAssignmentDto } from './dto/create-staff-assignment.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { PlanningService } from '../planning/planning.service';

@Injectable()
export class ResourcesService {
  private readonly logger = new Logger(ResourcesService.name);

  constructor(
    @InjectRepository(Equipment)
    private equipmentRepository: Repository<Equipment>,
    @InjectRepository(StaffAssignment)
    private staffAssignmentRepository: Repository<StaffAssignment>,
    private notificationsService: NotificationsService,
    private planningService: PlanningService,
  ) {}

  // --- Equipment ---
  async createEquipment(dto: CreateEquipmentDto): Promise<Equipment> {
    const equipment = this.equipmentRepository.create(dto);
    return this.equipmentRepository.save(equipment);
  }

  async findAllEquipment(operatingRoomId?: string, availableOnly?: boolean): Promise<Equipment[]> {
    const qb = this.equipmentRepository.createQueryBuilder('e').orderBy('e.name', 'ASC');
    if (operatingRoomId) {
      qb.andWhere('e.operating_room_id = :roomId', { roomId: operatingRoomId });
    }
    if (availableOnly) {
      qb.andWhere('e.is_available = :avail', { avail: true });
    }
    return qb.getMany();
  }

  async findEquipmentById(id: string): Promise<Equipment> {
    const equipment = await this.equipmentRepository.findOne({ where: { id } });
    if (!equipment) {
      throw new NotFoundException(`Equipo con ID ${id} no encontrado`);
    }
    return equipment;
  }

  async updateEquipment(id: string, dto: UpdateEquipmentDto): Promise<Equipment> {
    const equipment = await this.findEquipmentById(id);
    Object.assign(equipment, dto);
    return this.equipmentRepository.save(equipment);
  }

  async removeEquipment(id: string): Promise<void> {
    const equipment = await this.findEquipmentById(id);
    await this.equipmentRepository.remove(equipment);
  }

  // --- Staff assignments ---
  async createStaffAssignment(dto: CreateStaffAssignmentDto): Promise<StaffAssignment> {
    const assignment = this.staffAssignmentRepository.create({
      surgeryId: dto.surgeryId,
      userId: dto.userId,
      role: dto.role,
      notes: dto.notes,
    });
    const saved = await this.staffAssignmentRepository.save(assignment);
    try {
      const surgery = await this.planningService.findSurgeryById(dto.surgeryId);
      await this.notificationsService.notifyStaffAssignment(
        dto.userId,
        dto.surgeryId,
        surgery.procedure,
        dto.role,
      );
    } catch (err) {
      this.logger.warn(`No se pudo enviar notificación de asignación: ${err instanceof Error ? err.message : err}`);
    }
    return saved;
  }

  async findAssignmentsBySurgery(surgeryId: string): Promise<StaffAssignment[]> {
    return this.staffAssignmentRepository.find({
      where: { surgeryId },
      order: { assignedAt: 'ASC' },
    });
  }

  async findAssignmentsByUser(userId: string): Promise<StaffAssignment[]> {
    return this.staffAssignmentRepository.find({
      where: { userId },
      order: { assignedAt: 'DESC' },
    });
  }

  async removeStaffAssignment(id: string): Promise<void> {
    const assignment = await this.staffAssignmentRepository.findOne({ where: { id } });
    if (!assignment) {
      throw new NotFoundException(`Asignación con ID ${id} no encontrada`);
    }
    await this.staffAssignmentRepository.remove(assignment);
  }
}
