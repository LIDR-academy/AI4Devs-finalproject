import { Injectable, Inject } from "@nestjs/common";
import { ClfinPort, CLFIN_REPOSITORY } from "../domain/port";
import { ClfinEntity, ClfinParams } from "../domain/entity";
import { ClfinValue } from "../domain/value";

/**
 * UseCase de Información Financiera
 * Implementa la lógica de negocio para el módulo de Información Financiera
 * UN SOLO UseCase que implementa el Port directamente
 */
@Injectable()
export class ClfinUseCase implements ClfinPort {
  constructor(
    @Inject(CLFIN_REPOSITORY)
    private readonly repository: ClfinPort
  ) {}

  async findAll(params?: ClfinParams): Promise<{ data: ClfinEntity[]; total: number }> {
    return await this.repository.findAll(params);
  }

  async findById(id: number): Promise<ClfinEntity | null> {
    if (!id || id <= 0) {
      return null;
    }
    return await this.repository.findById(id);
  }

  async findByClienId(clienId: number): Promise<ClfinEntity[]> {
    if (!clienId || clienId <= 0) {
      return [];
    }
    return await this.repository.findByClienId(clienId);
  }

  async findByClienIdAndTipo(clienId: number, tipoFinanciero: number): Promise<ClfinEntity | null> {
    if (!clienId || clienId <= 0 || !tipoFinanciero) {
      return null;
    }
    return await this.repository.findByClienIdAndTipo(clienId, tipoFinanciero);
  }

  async create(data: ClfinEntity): Promise<ClfinEntity | null> {
    // Verificar constraint único: un cliente solo puede tener un registro por tipo
    const existing = await this.repository.findByClienIdAndTipo(data.clfin_cod_clien, data.clfin_cod_tifin);
    if (existing) {
      throw new Error(`Ya existe un registro financiero de tipo ${data.clfin_cod_tifin} para este cliente`);
    }
    
    // Normalizar datos mediante Value Object
    const clfinValue = new ClfinValue(data);
    const normalizedData = clfinValue.toJson();
    
    return await this.repository.create(normalizedData);
  }

  async update(id: number, data: ClfinEntity): Promise<ClfinEntity | null> {
    if (!id || id <= 0) {
      return null;
    }
    
    // Verificar que existe antes de actualizar
    const existing = await this.repository.findById(id);
    if (!existing) {
      return null;
    }
    
    // Si cambió el tipo, verificar constraint único
    if (existing.clfin_cod_tifin !== data.clfin_cod_tifin) {
      const existingByTipo = await this.repository.findByClienIdAndTipo(data.clfin_cod_clien, data.clfin_cod_tifin);
      if (existingByTipo && existingByTipo.clfin_cod_clfin !== id) {
        throw new Error(`Ya existe un registro financiero de tipo ${data.clfin_cod_tifin} para este cliente`);
      }
    }
    
    // Normalizar datos mediante Value Object
    const clfinValue = new ClfinValue(data, id);
    const normalizedData = clfinValue.toJson();
    
    return await this.repository.update(id, normalizedData);
  }

  async delete(id: number): Promise<ClfinEntity | null> {
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

