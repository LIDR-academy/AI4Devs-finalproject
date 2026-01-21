import { Injectable, Inject } from "@nestjs/common";
import { ClecoPort, CLECO_REPOSITORY } from "../domain/port";
import { ClecoEntity, ClecoParams } from "../domain/entity";
import { ClecoValue } from "../domain/value";

/**
 * UseCase de Actividad Económica
 * Implementa la lógica de negocio para el módulo de Actividad Económica
 * UN SOLO UseCase que implementa el Port directamente
 */
@Injectable()
export class ClecoUseCase implements ClecoPort {
  constructor(
    @Inject(CLECO_REPOSITORY)
    private readonly repository: ClecoPort
  ) {}

  async findAll(params?: ClecoParams): Promise<{ data: ClecoEntity[]; total: number }> {
    return await this.repository.findAll(params);
  }

  async findById(id: number): Promise<ClecoEntity | null> {
    if (!id || id <= 0) {
      return null;
    }
    return await this.repository.findById(id);
  }

  async findByClienId(clienId: number): Promise<ClecoEntity | null> {
    if (!clienId || clienId <= 0) {
      return null;
    }
    return await this.repository.findByClienId(clienId);
  }

  async create(data: ClecoEntity): Promise<ClecoEntity | null> {
    // Normalizar datos mediante Value Object
    const clecoValue = new ClecoValue(data);
    const normalizedData = clecoValue.toJson();
    
    return await this.repository.create(normalizedData);
  }

  async update(id: number, data: ClecoEntity): Promise<ClecoEntity | null> {
    if (!id || id <= 0) {
      return null;
    }
    
    // Verificar que existe antes de actualizar
    const existing = await this.repository.findById(id);
    if (!existing) {
      return null;
    }
    
    // Normalizar datos mediante Value Object
    const clecoValue = new ClecoValue(data, id);
    const normalizedData = clecoValue.toJson();
    
    return await this.repository.update(id, normalizedData);
  }

  async delete(id: number): Promise<ClecoEntity | null> {
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

