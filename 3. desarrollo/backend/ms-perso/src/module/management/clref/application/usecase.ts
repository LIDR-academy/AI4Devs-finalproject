import { Injectable, Inject } from "@nestjs/common";
import { ClrefPort, CLREF_REPOSITORY } from "../domain/port";
import { ClrefEntity, ClrefParams } from "../domain/entity";
import { ClrefValue } from "../domain/value";

/**
 * UseCase de Referencias
 * Implementa la lógica de negocio para el módulo de Referencias
 * UN SOLO UseCase que implementa el Port directamente
 */
@Injectable()
export class ClrefUseCase implements ClrefPort {
  constructor(
    @Inject(CLREF_REPOSITORY)
    private readonly repository: ClrefPort
  ) {}

  async findAll(params?: ClrefParams): Promise<{ data: ClrefEntity[]; total: number }> {
    return await this.repository.findAll(params);
  }

  async findById(id: number): Promise<ClrefEntity | null> {
    if (!id || id <= 0) {
      return null;
    }
    return await this.repository.findById(id);
  }

  async findByClienId(clienId: number): Promise<ClrefEntity[]> {
    if (!clienId || clienId <= 0) {
      return [];
    }
    return await this.repository.findByClienId(clienId);
  }

  async create(data: ClrefEntity): Promise<ClrefEntity | null> {
    // Validar constraint: si es financiera (tipo 3), debe tener número de cuenta y saldo
    if (data.clref_cod_tiref === 3) {
      if (!data.clref_num_ctadp || !data.clref_val_saldo) {
        throw new Error('Las referencias financieras requieren número de cuenta y saldo');
      }
    }
    
    // Normalizar datos mediante Value Object
    const clrefValue = new ClrefValue(data);
    const normalizedData = clrefValue.toJson();
    
    return await this.repository.create(normalizedData);
  }

  async update(id: number, data: ClrefEntity): Promise<ClrefEntity | null> {
    if (!id || id <= 0) {
      return null;
    }
    
    // Verificar que existe antes de actualizar
    const existing = await this.repository.findById(id);
    if (!existing) {
      return null;
    }
    
    // Validar constraint: si es financiera (tipo 3), debe tener número de cuenta y saldo
    if (data.clref_cod_tiref === 3) {
      if (!data.clref_num_ctadp || !data.clref_val_saldo) {
        throw new Error('Las referencias financieras requieren número de cuenta y saldo');
      }
    }
    
    // Normalizar datos mediante Value Object
    const clrefValue = new ClrefValue(data, id);
    const normalizedData = clrefValue.toJson();
    
    return await this.repository.update(id, normalizedData);
  }

  async delete(id: number): Promise<ClrefEntity | null> {
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

