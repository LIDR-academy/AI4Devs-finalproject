import { DecimalQuantity } from '../../stock/value-objects/DecimalQuantity.js';
import { Remanente } from '../../stock/entities/Remanente.js';
import { PreparationBalanceMismatchException } from '../errors/PreparationBalanceMismatchException.js';
import { WasteReasonRequiredException } from '../errors/WasteReasonRequiredException.js';
import { NonPristineReturnException } from '../errors/NonPristineReturnException.js';

export interface RecipePreparationItemProps {
  id: string;
  preparationId: string;
  insumoId: string;
  remanenteId: string;
  extractedQty: DecimalQuantity;
  consumedQty: DecimalQuantity;
  leftoverQty: DecimalQuantity;
  leftoverLocationId?: string;
  wastedQty: DecimalQuantity;
  wasteReason?: string;
}

/**
 * US-028 / ADR-003 §3.1: la conciliación de un ingrediente al cerrar una preparación.
 * `consumido = extraído − sobrante − merma` (asumido = teórico, decisión #5). El
 * invariante de cuadre exacto (#9) se verifica en el constructor — no hay forma de
 * materializar un ítem que no cuadre.
 */
export class RecipePreparationItem {
  private readonly props: RecipePreparationItemProps;

  constructor(props: RecipePreparationItemProps) {
    const sum = props.consumedQty.add(props.leftoverQty).add(props.wastedQty);
    if (!sum.toDecimal().equals(props.extractedQty.toDecimal())) {
      throw new PreparationBalanceMismatchException(
        props.insumoId,
        props.extractedQty.toString(),
        props.leftoverQty.toString(),
        props.wastedQty.toString()
      );
    }
    if (props.wastedQty.toDecimal().greaterThan(0) && !props.wasteReason?.trim()) {
      throw new WasteReasonRequiredException(props.insumoId);
    }
    this.props = { ...props };
  }

  /**
   * Concilia un remanente de la preparación: deriva el consumo y valida el cuadre.
   * `extraído` = lo que queda en el remanente al momento del cierre (si hubo consumo
   * ad-hoc previo, `currentQuantity < initialQuantity` y se concilia contra eso).
   */
  public static reconcile(input: {
    id: string;
    preparationId: string;
    remanente: Remanente;
    leftoverQty: DecimalQuantity;
    leftoverLocationId?: string;
    markedUnopened: boolean;
    wastedQty: DecimalQuantity;
    wasteReason?: string;
    /** `true` si `leftoverLocationId` apunta a un sub-sector de bodega (`type = WAREHOUSE`). */
    leftoverGoesToWarehouse: boolean;
  }): RecipePreparationItem {
    const { remanente, leftoverQty, wastedQty } = input;
    const extracted = remanente.currentQuantity;
    const removedByOperator = leftoverQty.add(wastedQty);
    if (!extracted.isGreaterThanOrEqualTo(removedByOperator)) {
      throw new PreparationBalanceMismatchException(
        remanente.insumoId,
        extracted.toString(),
        leftoverQty.toString(),
        wastedQty.toString()
      );
    }
    const consumedQty = extracted.subtract(removedByOperator);

    // #6: devolver a bodega solo si el remanente está intacto — cero consumo (ni previo
    // `isPristine`, ni derivado en este cierre), cero merma y "envase sin abrir".
    if (input.leftoverGoesToWarehouse) {
      const intact =
        remanente.isPristine &&
        input.markedUnopened &&
        consumedQty.toDecimal().isZero() &&
        wastedQty.toDecimal().isZero();
      if (!intact) {
        throw new NonPristineReturnException(remanente.insumoId);
      }
    }

    return new RecipePreparationItem({
      id: input.id,
      preparationId: input.preparationId,
      insumoId: remanente.insumoId,
      remanenteId: remanente.id,
      extractedQty: extracted,
      consumedQty,
      leftoverQty,
      leftoverLocationId: input.leftoverLocationId,
      wastedQty,
      wasteReason: input.wasteReason?.trim() || undefined,
    });
  }

  public get id(): string {
    return this.props.id;
  }

  public get preparationId(): string {
    return this.props.preparationId;
  }

  public get insumoId(): string {
    return this.props.insumoId;
  }

  public get remanenteId(): string {
    return this.props.remanenteId;
  }

  public get extractedQty(): DecimalQuantity {
    return this.props.extractedQty;
  }

  public get consumedQty(): DecimalQuantity {
    return this.props.consumedQty;
  }

  public get leftoverQty(): DecimalQuantity {
    return this.props.leftoverQty;
  }

  public get leftoverLocationId(): string | undefined {
    return this.props.leftoverLocationId;
  }

  public get wastedQty(): DecimalQuantity {
    return this.props.wastedQty;
  }

  public get wasteReason(): string | undefined {
    return this.props.wasteReason;
  }
}
