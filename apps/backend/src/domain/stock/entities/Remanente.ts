import { DecimalQuantity } from '../value-objects/DecimalQuantity.js';
import { ExcessConsumptionException } from '../../kitchen/errors/ExcessConsumptionException.js';

export type RemanenteStatusType = 'ACTIVE' | 'EXHAUSTED' | 'DISCARDED';

export interface RemanenteProps {
  id: string;
  insumoId: string;
  currentQuantity: DecimalQuantity;
  initialQuantity: DecimalQuantity;
  /** US-026: caché de display/movimiento (= `name` del área). Ver `storageLocationId`. */
  location: string;
  /** US-026: FK al área de cocina del catálogo (`StorageLocation type = KITCHEN`). */
  storageLocationId?: string;
  /** US-027: FK a la preparación de receta que originó este remanente. */
  recipePreparationId?: string;
  /**
   * US-028 / ADR-003 #6: `true` mientras no se haya consumido nada de este remanente
   * (`currentQuantity == initialQuantity`). Pasa a `false` en el primer `consumeQuantity`.
   * Junto con el marcado manual "envase sin abrir" del operario, habilita "devolver a bodega".
   */
  isPristine?: boolean;
  status: RemanenteStatusType;
  expirationDate: Date;
  createdAt?: Date;
  terminalAt?: Date;
}

export class Remanente {
  private readonly props: RemanenteProps;

  constructor(props: RemanenteProps) {
    this.props = { ...props, isPristine: props.isPristine ?? true };
  }

  public static createNew(
    id: string,
    insumoId: string,
    quantity: DecimalQuantity,
    location: string = 'KITCHEN_FRIDGE',
    hoursToExpire: number = 24,
    // AUDIT-DEV-006 F-3: instante de creación inyectable. Por defecto el reloj real
    // (compatibilidad con `vi.setSystemTime` en los tests de dominio existentes).
    now: Date = new Date(),
    // US-026: FK al área de cocina del catálogo. Opcional para compatibilidad con
    // los tests de dominio que solo pasan el literal.
    storageLocationId?: string
  ): Remanente {
    const expirationDate = new Date(now.getTime() + hoursToExpire * 60 * 60 * 1000);

    return new Remanente({
      id,
      insumoId,
      currentQuantity: quantity,
      initialQuantity: quantity,
      location,
      storageLocationId,
      status: 'ACTIVE',
      expirationDate,
      createdAt: now,
    });
  }

  public get id(): string {
    return this.props.id;
  }

  public get insumoId(): string {
    return this.props.insumoId;
  }

  public get currentQuantity(): DecimalQuantity {
    return this.props.currentQuantity;
  }

  public get initialQuantity(): DecimalQuantity {
    return this.props.initialQuantity;
  }

  public get location(): string {
    return this.props.location;
  }

  public get storageLocationId(): string | undefined {
    return this.props.storageLocationId;
  }

  public get recipePreparationId(): string | undefined {
    return this.props.recipePreparationId;
  }

  public get isPristine(): boolean {
    return this.props.isPristine ?? true;
  }

  /** US-027: enlaza el remanente a una preparación de receta abierta. */
  public linkToRecipePreparation(preparationId: string): void {
    this.props.recipePreparationId = preparationId;
  }

  /** US-028 Escenario 6: al abandonar la preparación, el remanente vuelve al pool FEFO. */
  public unlinkFromPreparation(): void {
    this.props.recipePreparationId = undefined;
  }

  /**
   * US-028 Escenario 1: el sobrante queda `ACTIVE` en la ubicación elegida y se
   * desvincula de la preparación (vuelve al pool FEFO). Conserva el `expirationDate`
   * original (decisión #10 — el frío no "renueva" un insumo abierto).
   */
  public relocateLeftover(storageLocationId: string, locationName: string): void {
    if (this.props.status !== 'ACTIVE') {
      throw new ExcessConsumptionException(
        'Reubicación de sobrante',
        '0.0000 (El remanente ya no está activo)'
      );
    }
    this.props.storageLocationId = storageLocationId;
    this.props.location = locationName;
    this.props.recipePreparationId = undefined;
  }

  /**
   * US-028 Escenario 3: sobrante intacto reingresado a bodega. Cierra el remanente
   * (terminal) y devuelve la cantidad reingresada para que el caso de uso
   * re-incremente `WarehouseStock`.
   */
  public returnToWarehouse(): DecimalQuantity {
    if (this.props.status !== 'ACTIVE') {
      throw new ExcessConsumptionException(
        'Devolución a bodega',
        '0.0000 (El remanente ya no está activo)'
      );
    }
    const returned = this.props.currentQuantity;
    this.props.currentQuantity = new DecimalQuantity('0.0000');
    this.props.status = 'EXHAUSTED';
    this.props.recipePreparationId = undefined;
    this.props.terminalAt = new Date();
    return returned;
  }

  public get status(): RemanenteStatusType {
    return this.props.status;
  }

  public get expirationDate(): Date {
    return this.props.expirationDate;
  }

  public get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  public get terminalAt(): Date | undefined {
    return this.props.terminalAt;
  }

  public consumeQuantity(quantityToConsume: DecimalQuantity): void {
    if (this.props.status !== 'ACTIVE') {
      throw new ExcessConsumptionException(
        quantityToConsume.toString(),
        '0.0000 (Remanente no esta activo)'
      );
    }

    if (!this.props.currentQuantity.isGreaterThanOrEqualTo(quantityToConsume)) {
      throw new ExcessConsumptionException(
        quantityToConsume.toString(),
        this.props.currentQuantity.toString()
      );
    }

    const remaining = this.props.currentQuantity.subtract(quantityToConsume);
    this.props.currentQuantity = remaining;
    // US-028 #6: cualquier consumo rompe el estado "intacto" — ya no puede devolverse a bodega.
    if (quantityToConsume.toDecimal().greaterThan(0)) {
      this.props.isPristine = false;
    }

    if (remaining.toNumber() === 0) {
      this.props.status = 'EXHAUSTED';
      // US-020: fija el instante exacto de la transicion terminal — nunca se infiere
      // de updatedAt, que tambien muta por operaciones no terminales (conciliacion).
      this.props.terminalAt = new Date();
    }
  }

  /**
   * TK-109 / US-008: sobrante encontrado en la conciliación de turno (varianza
   * positiva — el conteo físico superó al teórico). No exige motivo (no es una
   * pérdida) y no toca `isPristine` — un recuento con superávit no es una
   * manipulación del remanente, a diferencia de `consumeQuantity`.
   */
  public increaseQuantity(amount: DecimalQuantity): void {
    if (this.props.status !== 'ACTIVE') {
      throw new ExcessConsumptionException(
        `Ajuste de superávit de ${amount.toString()}`,
        '0.0000 (Remanente no esta activo)'
      );
    }
    this.props.currentQuantity = this.props.currentQuantity.add(amount);
  }

  public discard(): DecimalQuantity {
    if (this.props.status !== 'ACTIVE') {
      throw new ExcessConsumptionException(
        'Descarte de remanente',
        '0.0000 (El remanente ya esta inactivo)'
      );
    }

    const discardedQuantity = this.props.currentQuantity;
    this.props.currentQuantity = new DecimalQuantity('0.0000');
    this.props.status = 'DISCARDED';
    this.props.terminalAt = new Date();

    return discardedQuantity;
  }
}
