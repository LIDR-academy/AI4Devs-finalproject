import { Injectable, Inject } from "@nestjs/common";
import { ClrfiPort, CLRFI_REPOSITORY } from "../domain/port";
import { ClrfiEntity, ClrfiParams } from "../domain/entity";
import { ClrfiValue } from "../domain/value";

/**
 * UseCase de Residencia Fiscal
 * Implementa la lógica de negocio para el módulo de Residencia Fiscal
 * UN SOLO UseCase que implementa el Port directamente
 */
@Injectable()
export class ClrfiUseCase implements ClrfiPort {
  constructor(
    @Inject(CLRFI_REPOSITORY)
    private readonly repository: ClrfiPort
  ) {}

  async findAll(params?: ClrfiParams): Promise<{ data: ClrfiEntity[]; total: number }> {
    return await this.repository.findAll(params);
  }

  async findById(id: number): Promise<ClrfiEntity | null> {
    if (!id || id <= 0) {
      return null;
    }
    return await this.repository.findById(id);
  }

  async findByClienId(clienId: number): Promise<ClrfiEntity | null> {
    if (!clienId || clienId <= 0) {
      return null;
    }
    return await this.repository.findByClienId(clienId);
  }

  async create(data: ClrfiEntity): Promise<ClrfiEntity | null> {
    // Verificar constraint único: un cliente solo puede tener una residencia fiscal
    const existing = await this.repository.findByClienId(data.clrfi_cod_clien);
    if (existing) {
      throw new Error('Este cliente ya tiene una residencia fiscal registrada');
    }
    
    // Normalizar datos mediante Value Object
    const clrfiValue = new ClrfiValue(data);
    const normalizedData = clrfiValue.toJson();
    
    return await this.repository.create(normalizedData);
  }

  async update(id: number, data: ClrfiEntity): Promise<ClrfiEntity | null> {
    if (!id || id <= 0) {
      return null;
    }
    
    // Verificar que existe antes de actualizar
    const existing = await this.repository.findById(id);
    if (!existing) {
      return null;
    }
    
    // Si cambió el cliente, verificar constraint único
    if (existing.clrfi_cod_clien !== data.clrfi_cod_clien) {
      const existingByClien = await this.repository.findByClienId(data.clrfi_cod_clien);
      if (existingByClien && existingByClien.clrfi_cod_clrfi !== id) {
        throw new Error('Este cliente ya tiene una residencia fiscal registrada');
      }
    }
    
    // Normalizar datos mediante Value Object
    const clrfiValue = new ClrfiValue(data, id);
    const normalizedData = clrfiValue.toJson();
    
    return await this.repository.update(id, normalizedData);
  }

  async delete(id: number): Promise<ClrfiEntity | null> {
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

