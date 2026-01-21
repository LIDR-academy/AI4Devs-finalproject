import { Injectable, Inject } from "@nestjs/common";
import { CldomPort, CLDOM_REPOSITORY } from "../domain/port";
import { CldomEntity, CldomParams } from "../domain/entity";
import { CldomValue } from "../domain/value";

/**
 * UseCase de Domicilio
 * Implementa la lógica de negocio para el módulo de Domicilio
 * UN SOLO UseCase que implementa el Port directamente
 */
@Injectable()
export class CldomUseCase implements CldomPort {
  constructor(
    @Inject(CLDOM_REPOSITORY)
    private readonly repository: CldomPort
  ) {}

  async findAll(params?: CldomParams): Promise<{ data: CldomEntity[]; total: number }> {
    return await this.repository.findAll(params);
  }

  async findById(id: number): Promise<CldomEntity | null> {
    if (!id || id <= 0) {
      return null;
    }
    return await this.repository.findById(id);
  }

  async findByClienId(clienId: number): Promise<CldomEntity | null> {
    if (!clienId || clienId <= 0) {
      return null;
    }
    return await this.repository.findByClienId(clienId);
  }

  async create(data: CldomEntity): Promise<CldomEntity | null> {
    // Normalizar datos mediante Value Object
    const cldomValue = new CldomValue(data);
    const normalizedData = cldomValue.toJson();
    
    return await this.repository.create(normalizedData);
  }

  async update(id: number, data: CldomEntity): Promise<CldomEntity | null> {
    if (!id || id <= 0) {
      return null;
    }
    
    // Verificar que existe antes de actualizar
    const existing = await this.repository.findById(id);
    if (!existing) {
      return null;
    }
    
    // Normalizar datos mediante Value Object
    const cldomValue = new CldomValue(data, id);
    const normalizedData = cldomValue.toJson();
    
    return await this.repository.update(id, normalizedData);
  }

  async delete(id: number): Promise<CldomEntity | null> {
    if (!id || id <= 0) {
      return null;
    }
    
    // Verificar que existe antes de eliminar
    const existing = await this.repository.findById(id);
    if (!existing) {
      return null;
    }
    
    return await this.repository.delete(id);
  }
}

