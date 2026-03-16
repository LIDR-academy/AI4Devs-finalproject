import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OperatingRoom } from '../entities/operating-room.entity';
import { CreateOperatingRoomDto } from '../dto/create-operating-room.dto';
import { UpdateOperatingRoomDto } from '../dto/update-operating-room.dto';

@Injectable()
export class OperatingRoomService {
  private readonly logger = new Logger(OperatingRoomService.name);

  constructor(
    @InjectRepository(OperatingRoom)
    private operatingRoomRepository: Repository<OperatingRoom>,
  ) {}

  /**
   * Crear nuevo quirófano
   */
  async create(createDto: CreateOperatingRoomDto): Promise<OperatingRoom> {
    // Verificar si ya existe un quirófano con el mismo código
    if (createDto.code) {
      const existing = await this.operatingRoomRepository.findOne({
        where: { code: createDto.code },
      });

      if (existing) {
        throw new BadRequestException(
          `Ya existe un quirófano con el código ${createDto.code}`,
        );
      }
    }

    const operatingRoom = this.operatingRoomRepository.create({
      ...createDto,
      isActive: createDto.isActive ?? true,
    });

    const saved = await this.operatingRoomRepository.save(operatingRoom);
    this.logger.log(`Quirófano creado: ${saved.id} - ${saved.name}`);

    return saved;
  }

  /**
   * Obtener todos los quirófanos
   */
  async findAll(activeOnly?: boolean): Promise<OperatingRoom[]> {
    const queryBuilder = this.operatingRoomRepository.createQueryBuilder('room');

    if (activeOnly) {
      queryBuilder.where('room.isActive = :isActive', { isActive: true });
    }

    queryBuilder.orderBy('room.name', 'ASC');

    return queryBuilder.getMany();
  }

  /**
   * Obtener quirófano por ID
   */
  async findOne(id: string): Promise<OperatingRoom> {
    const operatingRoom = await this.operatingRoomRepository.findOne({
      where: { id },
    });

    if (!operatingRoom) {
      throw new NotFoundException(`Quirófano con ID ${id} no encontrado`);
    }

    return operatingRoom;
  }

  /**
   * Actualizar quirófano
   */
  async update(
    id: string,
    updateDto: UpdateOperatingRoomDto,
  ): Promise<OperatingRoom> {
    const operatingRoom = await this.findOne(id);

    // Verificar código único si se actualiza
    if (updateDto.code && updateDto.code !== operatingRoom.code) {
      const existing = await this.operatingRoomRepository.findOne({
        where: { code: updateDto.code },
      });

      if (existing) {
        throw new BadRequestException(
          `Ya existe un quirófano con el código ${updateDto.code}`,
        );
      }
    }

    Object.assign(operatingRoom, updateDto);

    const updated = await this.operatingRoomRepository.save(operatingRoom);
    this.logger.log(`Quirófano actualizado: ${id}`);

    return updated;
  }

  /**
   * Eliminar quirófano (soft delete marcándolo como inactivo)
   */
  async remove(id: string): Promise<void> {
    const operatingRoom = await this.findOne(id);

    // En lugar de eliminar físicamente, marcamos como inactivo
    operatingRoom.isActive = false;
    await this.operatingRoomRepository.save(operatingRoom);

    this.logger.log(`Quirófano desactivado: ${id}`);
  }
}
