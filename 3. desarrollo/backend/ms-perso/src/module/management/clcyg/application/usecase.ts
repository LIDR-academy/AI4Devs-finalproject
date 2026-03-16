import { Injectable, Inject } from "@nestjs/common";
import { ClcygPort, CLCYG_REPOSITORY } from "../domain/port";
import { ClcygEntity, ClcygParams } from "../domain/entity";
import { ClcygValue } from "../domain/value";

/**
 * UseCase de Cónyuge
 * Implementa la lógica de negocio para el módulo de Cónyuge
 * UN SOLO UseCase que implementa el Port directamente
 */
@Injectable()
export class ClcygUseCase implements ClcygPort {
  constructor(
    @Inject(CLCYG_REPOSITORY)
    private readonly repository: ClcygPort
  ) {}

  async findAll(params?: ClcygParams): Promise<{ data: ClcygEntity[]; total: number }> {
    return await this.repository.findAll(params);
  }

  async findById(id: number): Promise<ClcygEntity | null> {
    if (!id || id <= 0) {
      return null;
    }
    return await this.repository.findById(id);
  }

  async findByClienId(clienId: number): Promise<ClcygEntity | null> {
    if (!clienId || clienId <= 0) {
      return null;
    }
    return await this.repository.findByClienId(clienId);
  }

  async create(data: ClcygEntity): Promise<ClcygEntity | null> {
    // Normalizar datos mediante Value Object
    const clcygValue = new ClcygValue(data);
    const normalizedData = clcygValue.toJson();
    
    return await this.repository.create(normalizedData);
  }

  async update(id: number, data: ClcygEntity): Promise<ClcygEntity | null> {
    if (!id || id <= 0) {
      return null;
    }
    
    // Verificar que existe antes de actualizar
    const existing = await this.repository.findById(id);
    if (!existing) {
      return null;
    }
    
    // Normalizar datos mediante Value Object
    const clcygValue = new ClcygValue(data, id);
    const normalizedData = clcygValue.toJson();
    
    return await this.repository.update(id, normalizedData);
  }

  async delete(id: number): Promise<ClcygEntity | null> {
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

