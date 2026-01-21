import { Injectable, Inject } from "@nestjs/common";
import { ClasmPort, CLASM_REPOSITORY } from "../domain/port";
import { ClasmEntity, ClasmParams } from "../domain/entity";
import { ClasmValue } from "../domain/value";

/**
 * UseCase de Asamblea
 * Implementa la lógica de negocio para el módulo de Asamblea
 * UN SOLO UseCase que implementa el Port directamente
 */
@Injectable()
export class ClasmUseCase implements ClasmPort {
  constructor(
    @Inject(CLASM_REPOSITORY)
    private readonly repository: ClasmPort
  ) {}

  async findAll(params?: ClasmParams): Promise<{ data: ClasmEntity[]; total: number }> {
    return await this.repository.findAll(params);
  }

  async findById(id: number): Promise<ClasmEntity | null> {
    if (!id || id <= 0) {
      return null;
    }
    return await this.repository.findById(id);
  }

  async findByClienId(clienId: number): Promise<ClasmEntity | null> {
    if (!clienId || clienId <= 0) {
      return null;
    }
    return await this.repository.findByClienId(clienId);
  }

  async create(data: ClasmEntity): Promise<ClasmEntity | null> {
    // Verificar constraint único: un cliente solo puede tener una asamblea
    const existing = await this.repository.findByClienId(data.clasm_cod_clien);
    if (existing) {
      throw new Error('Este cliente ya tiene una participación en asamblea registrada');
    }
    
    // Validación: Si es directivo, debe tener fecha de nombramiento directivo
    if (data.clasm_ctr_direc && !data.clasm_fec_direc) {
      throw new Error('Si el cliente es directivo, debe especificar la fecha de nombramiento como directivo');
    }
    
    // Normalizar datos mediante Value Object
    const clasmValue = new ClasmValue(data);
    const normalizedData = clasmValue.toJson();
    
    return await this.repository.create(normalizedData);
  }

  async update(id: number, data: ClasmEntity): Promise<ClasmEntity | null> {
    if (!id || id <= 0) {
      return null;
    }
    
    // Verificar que existe antes de actualizar
    const existing = await this.repository.findById(id);
    if (!existing) {
      return null;
    }
    
    // Si cambió el cliente, verificar constraint único
    if (existing.clasm_cod_clien !== data.clasm_cod_clien) {
      const existingByClien = await this.repository.findByClienId(data.clasm_cod_clien);
      if (existingByClien && existingByClien.clasm_cod_clasm !== id) {
        throw new Error('Este cliente ya tiene una participación en asamblea registrada');
      }
    }
    
    // Validación: Si es directivo, debe tener fecha de nombramiento directivo
    if (data.clasm_ctr_direc && !data.clasm_fec_direc) {
      throw new Error('Si el cliente es directivo, debe especificar la fecha de nombramiento como directivo');
    }
    
    // Normalizar datos mediante Value Object
    const clasmValue = new ClasmValue(data, id);
    const normalizedData = clasmValue.toJson();
    
    return await this.repository.update(id, normalizedData);
  }

  async delete(id: number): Promise<ClasmEntity | null> {
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

