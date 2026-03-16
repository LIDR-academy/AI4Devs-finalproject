import { Injectable, Inject } from "@nestjs/common";
import { ClrepPort, CLREP_REPOSITORY } from "../domain/port";
import { ClrepEntity, ClrepParams } from "../domain/entity";
import { ClrepValue } from "../domain/value";

/**
 * UseCase de Representante
 * Implementa la lógica de negocio para el módulo de Representante
 * UN SOLO UseCase que implementa el Port directamente
 */
@Injectable()
export class ClrepUseCase implements ClrepPort {
  constructor(
    @Inject(CLREP_REPOSITORY)
    private readonly repository: ClrepPort
  ) {}

  async findAll(params?: ClrepParams): Promise<{ data: ClrepEntity[]; total: number }> {
    return await this.repository.findAll(params);
  }

  async findById(id: number): Promise<ClrepEntity | null> {
    if (!id || id <= 0) {
      return null;
    }
    return await this.repository.findById(id);
  }

  async findByClienId(clienId: number): Promise<ClrepEntity | null> {
    if (!clienId || clienId <= 0) {
      return null;
    }
    return await this.repository.findByClienId(clienId);
  }

  async create(data: ClrepEntity): Promise<ClrepEntity | null> {
    // Normalizar datos mediante Value Object
    const clrepValue = new ClrepValue(data);
    const normalizedData = clrepValue.toJson();
    
    return await this.repository.create(normalizedData);
  }

  async update(id: number, data: ClrepEntity): Promise<ClrepEntity | null> {
    if (!id || id <= 0) {
      return null;
    }
    
    // Verificar que existe antes de actualizar
    const existing = await this.repository.findById(id);
    if (!existing) {
      return null;
    }
    
    // Normalizar datos mediante Value Object
    const clrepValue = new ClrepValue(data, id);
    const normalizedData = clrepValue.toJson();
    
    return await this.repository.update(id, normalizedData);
  }

  async delete(id: number): Promise<ClrepEntity | null> {
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

