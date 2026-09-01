import { IInsumoRepository } from '../../../domain/stock/repositories/IInsumoRepository.js';
import { InsumoOutputDTO } from './CreateInsumoUseCase.js';

export class ListInsumosUseCase {
  constructor(private readonly insumoRepository: IInsumoRepository) {}

  public async execute(): Promise<InsumoOutputDTO[]> {
    const list = await this.insumoRepository.findAll();
    return list.map((insumo) => ({
      id: insumo.id,
      name: insumo.name,
      unitOfMeasure: insumo.unitOfMeasure,
      warehouseStock: insumo.warehouseStock.toString(),
      unitCost: insumo.unitCost ? insumo.unitCost.toDecimal().toFixed(2) : null,
    }));
  }
}
