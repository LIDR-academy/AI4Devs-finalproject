import { IInsumoRepository } from '../../../domain/stock/repositories/IInsumoRepository.js';
import { IStorageLocationRepository } from '../../../domain/stock/repositories/IStorageLocationRepository.js';
import { InsumoOutputDTO, mapInsumoToOutputDTO, buildLocationNameMap } from '../mappers/insumoOutputMapper.js';

export class ListInsumosUseCase {
  constructor(
    private readonly insumoRepository: IInsumoRepository,
    private readonly locationRepository?: IStorageLocationRepository
  ) {}

  public async execute(): Promise<InsumoOutputDTO[]> {
    const [list, locationNames] = await Promise.all([
      this.insumoRepository.findAll(),
      buildLocationNameMap(this.locationRepository),
    ]);

    return list.map((insumo) => mapInsumoToOutputDTO(insumo, (id) => locationNames.get(id) ?? id));
  }
}
