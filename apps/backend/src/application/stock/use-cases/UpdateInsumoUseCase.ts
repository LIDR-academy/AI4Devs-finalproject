import { IInsumoRepository } from '../../../domain/stock/repositories/IInsumoRepository.js';
import { IStorageLocationRepository } from '../../../domain/stock/repositories/IStorageLocationRepository.js';
import { Insumo } from '../../../domain/stock/entities/Insumo.js';
import { DecimalQuantity } from '../../../domain/stock/value-objects/DecimalQuantity.js';
import { InsumoAlreadyExistsException } from '../../../domain/stock/errors/InsumoAlreadyExistsException.js';
import { EntityNotFoundException } from '../../../domain/errors/EntityNotFoundException.js';
import { InsumoOutputDTO, mapInsumoToOutputDTO, buildLocationNameMap } from '../mappers/insumoOutputMapper.js';

export interface UpdateInsumoInputDTO {
  id: string;
  /** Ausente = conservar. */
  name?: string;
  /** Ausente = conservar; `null` = limpiar. */
  unitCost?: string | null;
  /** Ausente = conservar; `null` = limpiar. */
  barcode?: string | null;
}

/**
 * US-036: edición de `name` / `unitCost` / `barcode` de un insumo existente.
 * `unitOfMeasure` y las líneas de stock son inmutables por esta vía (decisión de
 * negocio Guard 28: cambiar la unidad reinterpreta las cantidades físicas).
 */
export class UpdateInsumoUseCase {
  constructor(
    private readonly insumoRepository: IInsumoRepository,
    private readonly locationRepository?: IStorageLocationRepository
  ) {}

  public async execute(input: UpdateInsumoInputDTO): Promise<InsumoOutputDTO> {
    const insumo = await this.insumoRepository.findById(input.id);
    if (!insumo) {
      throw new EntityNotFoundException('Insumo', input.id);
    }

    const nextName = input.name !== undefined ? input.name.trim() : undefined;
    const nextBarcode = this.resolveBarcodePatch(input.barcode);

    await this.assertNameFree(insumo, nextName);
    await this.assertBarcodeFree(insumo, nextBarcode);

    const updated = insumo.withDetails({
      name: nextName,
      unitCost: this.resolveUnitCostPatch(input.unitCost),
      barcode: nextBarcode,
    });
    await this.insumoRepository.save(updated);

    const locationNames = await buildLocationNameMap(this.locationRepository);
    return mapInsumoToOutputDTO(updated, (id) => locationNames.get(id) ?? id);
  }

  private async assertNameFree(insumo: Insumo, nextName: string | undefined): Promise<void> {
    if (!nextName || nextName === insumo.name) return;
    const clash = await this.insumoRepository.findByName(nextName);
    if (clash && clash.id !== insumo.id) {
      throw new InsumoAlreadyExistsException(`El insumo '${nextName}' ya esta registrado en el catalogo.`);
    }
  }

  private async assertBarcodeFree(insumo: Insumo, nextBarcode: string | null | undefined): Promise<void> {
    if (typeof nextBarcode !== 'string' || nextBarcode === insumo.barcode) return;
    const clash = await this.insumoRepository.findByBarcode(nextBarcode);
    if (clash && clash.id !== insumo.id) {
      throw new InsumoAlreadyExistsException('Ya existe un insumo registrado con ese código de barras.');
    }
  }

  private resolveUnitCostPatch(raw: string | null | undefined): DecimalQuantity | null | undefined {
    if (raw === undefined) return undefined;
    if (raw === null) return null;
    return new DecimalQuantity(raw);
  }

  private resolveBarcodePatch(raw: string | null | undefined): string | null | undefined {
    if (raw === undefined) return undefined;
    if (raw === null) return null;
    return raw.trim();
  }
}
