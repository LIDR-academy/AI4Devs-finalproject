import { Injectable, Inject } from "@nestjs/common";
import { CllabPort, CLLAB_REPOSITORY } from "../domain/port";
import { CllabEntity, CllabParams } from "../domain/entity";
import { CllabValue } from "../domain/value";

/**
 * UseCase de Información Laboral
 * Implementa la lógica de negocio para el módulo de Información Laboral
 * UN SOLO UseCase que implementa el Port directamente
 */
@Injectable()
export class CllabUseCase implements CllabPort {
  constructor(
    @Inject(CLLAB_REPOSITORY)
    private readonly repository: CllabPort
  ) {}

  async findAll(params?: CllabParams): Promise<{ data: CllabEntity[]; total: number }> {
    return await this.repository.findAll(params);
  }

  async findById(id: number): Promise<CllabEntity | null> {
    if (!id || id <= 0) {
      return null;
    }
    return await this.repository.findById(id);
  }

  async findByClienId(clienId: number): Promise<CllabEntity | null> {
    if (!clienId || clienId <= 0) {
      return null;
    }
    return await this.repository.findByClienId(clienId);
  }

  async create(data: CllabEntity): Promise<CllabEntity | null> {
    // Normalizar datos mediante Value Object
    const cllabValue = new CllabValue(data);
    const normalizedData = cllabValue.toJson();
    
    return await this.repository.create(normalizedData);
  }

  async update(id: number, data: CllabEntity): Promise<CllabEntity | null> {
    if (!id || id <= 0) {
      return null;
    }
    
    // Verificar que existe antes de actualizar
    const existing = await this.repository.findById(id);
    if (!existing) {
      return null;
    }
    
    // Normalizar datos mediante Value Object
    const cllabValue = new CllabValue(data, id);
    const normalizedData = cllabValue.toJson();
    
    return await this.repository.update(id, normalizedData);
  }

  async delete(id: number): Promise<CllabEntity | null> {
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

