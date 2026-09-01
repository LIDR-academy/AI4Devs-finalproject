import { IInsumoRepository } from '../../../domain/stock/repositories/IInsumoRepository.js';
import { Insumo } from '../../../domain/stock/entities/Insumo.js';
import { DecimalQuantity } from '../../../domain/stock/value-objects/DecimalQuantity.js';
import { InsumoAlreadyExistsException } from '../../../domain/stock/errors/InsumoAlreadyExistsException.js';
import crypto from 'crypto';

export interface CreateInsumoInputDTO {
  name: string;
  unitOfMeasure: string;
  initialWarehouseStock?: string;
  unitCost?: string;
}

export interface InsumoOutputDTO {
  id: string;
  name: string;
  unitOfMeasure: string;
  warehouseStock: string;
  unitCost: string | null;
}

export class CreateInsumoUseCase {
  constructor(private readonly insumoRepository: IInsumoRepository) {}

  public async execute(input: CreateInsumoInputDTO): Promise<InsumoOutputDTO> {
    const trimmedName = input.name.trim();

    const existing = await this.insumoRepository.findByName(trimmedName);
    if (existing) {
      throw new InsumoAlreadyExistsException(`El insumo '${trimmedName}' ya esta registrado en el catalogo.`);
    }

    const stockQtyStr = input.initialWarehouseStock ?? '0';
    const insumo = new Insumo({
      id: `ins-${crypto.randomBytes(4).toString('hex')}`,
      name: trimmedName,
      unitOfMeasure: input.unitOfMeasure.toUpperCase(),
      warehouseStock: new DecimalQuantity(stockQtyStr),
      unitCost: input.unitCost !== undefined ? new DecimalQuantity(input.unitCost) : undefined,
    });

    await this.insumoRepository.save(insumo);

    return {
      id: insumo.id,
      name: insumo.name,
      unitOfMeasure: insumo.unitOfMeasure,
      warehouseStock: insumo.warehouseStock.toString(),
      unitCost: insumo.unitCost ? insumo.unitCost.toDecimal().toFixed(2) : null,
    };
  }
}
