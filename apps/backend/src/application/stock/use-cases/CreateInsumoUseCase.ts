import crypto from 'crypto';
import { Insumo } from '../../../domain/stock/entities/Insumo.js';
import { DecimalQuantity } from '../../../domain/stock/value-objects/DecimalQuantity.js';
import { IInsumoRepository } from '../../../domain/stock/repositories/IInsumoRepository.js';

export interface CreateInsumoDTO {
  name: string;
  unitOfMeasure: string;
}

export interface CreateInsumoResponseDTO {
  id: string;
  name: string;
  unitOfMeasure: string;
  warehouseStock: string;
}

export class CreateInsumoUseCase {
  constructor(private readonly insumoRepository: IInsumoRepository) {}

  public async execute(dto: CreateInsumoDTO): Promise<CreateInsumoResponseDTO> {
    const insumo = new Insumo({
      id: crypto.randomUUID(),
      name: dto.name,
      unitOfMeasure: dto.unitOfMeasure,
      warehouseStock: new DecimalQuantity(0),
    });

    await this.insumoRepository.save(insumo);

    return {
      id: insumo.id,
      name: insumo.name,
      unitOfMeasure: insumo.unitOfMeasure,
      warehouseStock: insumo.warehouseStock.toString(),
    };
  }
}
