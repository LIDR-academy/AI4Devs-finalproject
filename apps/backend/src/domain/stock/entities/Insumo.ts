import { DecimalQuantity } from '../value-objects/DecimalQuantity.js';
import { InsufficientStockException } from '../errors/InsufficientStockException.js';

/**
 * Sector semilla al que se re-apuntan las existencias migradas desde la antigua
 * ubicación única `MAIN_WAREHOUSE` (US-025). Los casos de uso legados que no
 * indican sub-sector operan implícitamente sobre esta línea.
 */
export const UNCLASSIFIED_WAREHOUSE_LOCATION_ID = 'loc-seed-unclassified';

export interface WarehouseStockLine {
  storageLocationId: string;
  quantity: DecimalQuantity;
}

export interface InsumoProps {
  id: string;
  name: string;
  unitOfMeasure: string;
  unitCost?: DecimalQuantity;
  /** US-032: código de barras (UPC/EAN) escaneado con la cámara del dispositivo. Único cuando presente. */
  barcode?: string;
  /** Existencias por sub-sector de bodega (US-025). Fuente canónica del stock. */
  stockLines?: WarehouseStockLine[];
  /**
   * @deprecated Stock de bodega en una sola ubicación. Se conserva por
   * retrocompatibilidad: se convierte en una única línea del sector "sin clasificar".
   */
  warehouseStock?: DecimalQuantity;
}

/**
 * Agregado `Insumo` (US-025). El stock de bodega ya no es un escalar: es la suma
 * de una o varias `WarehouseStockLine`, una por cada sub-sector físico donde el
 * insumo tiene existencias. Toda operación de saldo se resuelve a nivel de línea.
 */
export class Insumo {
  private readonly _id: string;
  private readonly _name: string;
  private readonly _unitOfMeasure: string;
  private readonly _unitCost?: DecimalQuantity;
  private readonly _barcode?: string;
  private readonly _lines: Map<string, DecimalQuantity>;

  constructor(props: InsumoProps) {
    this._id = props.id;
    this._name = props.name;
    this._unitOfMeasure = props.unitOfMeasure;
    this._unitCost = props.unitCost;
    this._barcode = props.barcode;
    this._lines = new Map();

    if (props.stockLines && props.stockLines.length > 0) {
      for (const line of props.stockLines) {
        this._lines.set(line.storageLocationId, line.quantity);
      }
    } else if (props.warehouseStock && !props.warehouseStock.toDecimal().isZero()) {
      this._lines.set(UNCLASSIFIED_WAREHOUSE_LOCATION_ID, props.warehouseStock);
    }
  }

  /**
   * FASE 4.B (revisor adversarial, TK-119): reconstruye el agregado con líneas de
   * stock nuevas, copiando explícitamente TODOS los demás campos actuales (incluido
   * cualquier campo futuro) — cierra de raíz la clase de bug donde un fake in-memory
   * que reconstruye `new Insumo({...})` a mano en vez de mutar in-place pierde en
   * silencio un campo que no supo que tenía que listar (ocurrió con `barcode`).
   */
  public withStockLines(nextLines: WarehouseStockLine[]): Insumo {
    return new Insumo({
      id: this._id,
      name: this._name,
      unitOfMeasure: this._unitOfMeasure,
      unitCost: this._unitCost,
      barcode: this._barcode,
      stockLines: nextLines,
    });
  }

  /**
   * US-036: reconstruye el agregado editando `name` / `unitCost` / `barcode` y
   * **preservando** `id`, `unitOfMeasure` y las líneas de stock. En el patch,
   * `undefined` conserva el valor actual; `null` (solo `unitCost` / `barcode`)
   * lo limpia. Mismo criterio de copia exhaustiva que `withStockLines`.
   */
  public withDetails(patch: {
    name?: string;
    unitCost?: DecimalQuantity | null;
    barcode?: string | null;
  }): Insumo {
    return new Insumo({
      id: this._id,
      name: patch.name ?? this._name,
      unitOfMeasure: this._unitOfMeasure,
      unitCost: patch.unitCost === undefined ? this._unitCost : (patch.unitCost ?? undefined),
      barcode: patch.barcode === undefined ? this._barcode : (patch.barcode ?? undefined),
      stockLines: this.stockLines,
    });
  }

  public get id(): string {
    return this._id;
  }

  public get name(): string {
    return this._name;
  }

  public get unitOfMeasure(): string {
    return this._unitOfMeasure;
  }

  public get unitCost(): DecimalQuantity | undefined {
    return this._unitCost;
  }

  public get barcode(): string | undefined {
    return this._barcode;
  }

  /** Suma de todas las líneas de stock de bodega. */
  public get warehouseStock(): DecimalQuantity {
    let total = new DecimalQuantity('0');
    for (const qty of this._lines.values()) {
      total = total.add(qty);
    }
    return total;
  }

  /** Líneas de stock, una por sub-sector con existencias. */
  public get stockLines(): WarehouseStockLine[] {
    return Array.from(this._lines.entries()).map(([storageLocationId, quantity]) => ({
      storageLocationId,
      quantity,
    }));
  }

  public stockAt(storageLocationId: string): DecimalQuantity {
    return this._lines.get(storageLocationId) ?? new DecimalQuantity('0');
  }

  public hasSufficientStock(requested: DecimalQuantity): boolean {
    return this.warehouseStock.isGreaterThanOrEqualTo(requested);
  }

  public hasSufficientStockAt(requested: DecimalQuantity, storageLocationId: string): boolean {
    return this.stockAt(storageLocationId).isGreaterThanOrEqualTo(requested);
  }

  /**
   * Debita de la línea del sub-sector indicado. Rechaza atómicamente si el saldo
   * de ESE sector es insuficiente, sin tocar ninguna otra línea (Invariante 1 por-sector).
   */
  public deductStockAt(quantity: DecimalQuantity, storageLocationId: string): void {
    const current = this.stockAt(storageLocationId);
    if (!current.isGreaterThanOrEqualTo(quantity)) {
      throw new InsufficientStockException(this._name, quantity.toString(), current.toString());
    }
    this._lines.set(storageLocationId, current.subtract(quantity));
  }

  /** Suma a la línea del sub-sector indicado, creándola si aún no existía. */
  public restockAt(quantity: DecimalQuantity, storageLocationId: string): void {
    const current = this.stockAt(storageLocationId);
    this._lines.set(storageLocationId, current.add(quantity));
  }

  /** @deprecated Usa `deductStockAt`. Opera sobre el sector "sin clasificar". */
  public deductStock(quantity: DecimalQuantity): void {
    this.deductStockAt(quantity, UNCLASSIFIED_WAREHOUSE_LOCATION_ID);
  }

  /** @deprecated Usa `restockAt`. Opera sobre el sector "sin clasificar". */
  public increaseStock(quantity: DecimalQuantity): void {
    this.restockAt(quantity, UNCLASSIFIED_WAREHOUSE_LOCATION_ID);
  }
}
