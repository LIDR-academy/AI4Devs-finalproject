import { IInsumoRepository } from '../../../domain/stock/repositories/IInsumoRepository.js';
import { IStorageLocationRepository } from '../../../domain/stock/repositories/IStorageLocationRepository.js';
import { EntityNotFoundException } from '../../../domain/errors/EntityNotFoundException.js';
import { InsumoOutputDTO, mapInsumoToOutputDTO, buildLocationNameMap } from '../mappers/insumoOutputMapper.js';

export interface FindInsumoByBarcodeInputDTO {
  barcode: string;
}

/**
 * US-032/TK-119: búsqueda de insumo por código de barras escaneado con la cámara
 * del dispositivo. Sin match, lanza EntityNotFoundException (404) — nunca crea un
 * insumo automáticamente (decisión de negocio: solo ADMIN completa el alta).
 */
export class FindInsumoByBarcodeUseCase {
  constructor(
    private readonly insumoRepository: IInsumoRepository,
    private readonly locationRepository?: IStorageLocationRepository
  ) {}

  public async execute(dto: FindInsumoByBarcodeInputDTO): Promise<InsumoOutputDTO> {
    // Simetría con el trim de CreateInsumoUseCase (FASE 4.B): un barcode se persiste
    // siempre recortado, así que la búsqueda debe recortar el mismo espacio incidental
    // para que el match exacto no falle silenciosamente.
    const trimmedBarcode = dto.barcode.trim();
    const insumo = await this.insumoRepository.findByBarcode(trimmedBarcode);
    if (!insumo) {
      throw new EntityNotFoundException('Insumo', trimmedBarcode);
    }

    // Revisor adversarial (FASE 4.B): sin esto, storageLocationName devolvía el id
    // crudo en vez del nombre resuelto — inconsistente con ListInsumosUseCase/
    // CreateInsumoUseCase y con el contrato documentado en CreateInsumoResponse.
    const locationNames = await buildLocationNameMap(this.locationRepository);
    return mapInsumoToOutputDTO(insumo, (id) => locationNames.get(id) ?? id);
  }
}
