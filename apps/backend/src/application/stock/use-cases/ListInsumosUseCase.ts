import { IInsumoRepository } from '../../../domain/stock/repositories/IInsumoRepository.js';

export interface InsumoListItemDTO {
  id: string;
  name: string;
  unitOfMeasure: string;
  warehouseStock: string;
}

export class ListInsumosUseCase {
  constructor(private readonly insumoRepository: IInsumoRepository) {}

  public async execute(): Promise<InsumoListItemDTO[]> {
    const insumos = await this.insumoRepository.findAll();

    return insumos.map((insumo) => ({
      id: insumo.id,
      name: insumo.name,
      unitOfMeasure: insumo.unitOfMeasure,
      warehouseStock: insumo.warehouseStock.toString(),
    }));
  }
}
