import { Injectable, Inject } from "@nestjs/common";
import { ClbenPort, CLBEN_REPOSITORY } from "../domain/port";
import { ClbenEntity, ClbenParams } from "../domain/entity";
import { ClbenValue } from "../domain/value";

/**
 * UseCase de Beneficiarios
 * Implementa la lógica de negocio para el módulo de Beneficiarios
 * UN SOLO UseCase que implementa el Port directamente
 */
@Injectable()
export class ClbenUseCase implements ClbenPort {
  constructor(
    @Inject(CLBEN_REPOSITORY)
    private readonly repository: ClbenPort
  ) {}

  async findAll(params?: ClbenParams): Promise<{ data: ClbenEntity[]; total: number }> {
    return await this.repository.findAll(params);
  }

  async findById(id: number): Promise<ClbenEntity | null> {
    if (!id || id <= 0) {
      return null;
    }
    return await this.repository.findById(id);
  }

  async findByClbncId(clbncId: number): Promise<ClbenEntity[]> {
    if (!clbncId || clbncId <= 0) {
      return [];
    }
    return await this.repository.findByClbncId(clbncId);
  }

  async create(data: ClbenEntity): Promise<ClbenEntity | null> {
    // Normalizar datos mediante Value Object
    const clbenValue = new ClbenValue(data);
    const normalizedData = clbenValue.toJson();
    
    return await this.repository.create(normalizedData);
  }

  async update(id: number, data: ClbenEntity): Promise<ClbenEntity | null> {
    if (!id || id <= 0) {
      return null;
    }
    
    // Verificar que existe antes de actualizar
    const existing = await this.repository.findById(id);
    if (!existing) {
      return null;
    }
    
    // Normalizar datos mediante Value Object
    const clbenValue = new ClbenValue(data, id);
    const normalizedData = clbenValue.toJson();
    
    return await this.repository.update(id, normalizedData);
  }

  async delete(id: number): Promise<ClbenEntity | null> {
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

