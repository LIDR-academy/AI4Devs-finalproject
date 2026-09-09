import { PreparationNotOpenException } from '../errors/PreparationNotOpenException.js';

export type RecipePreparationStatus = 'OPEN' | 'CLOSED' | 'ABANDONED';

export interface RecipePreparationProps {
  id: string;
  recipeId: string;
  plannedPortions: number;
  status: RecipePreparationStatus;
  openedByOperatorId?: string;
  openedAt: Date;
  actualPortions?: number;
  closedByOperatorId?: string;
  closedAt?: Date;
  notes?: string;
}

/**
 * US-027 / ADR-003: una tanda de preparación de una receta. Se abre automáticamente
 * al extraer de bodega con `purpose = RECIPE` y agrupa los `Remanente` de esa tanda.
 * El cierre (consumo / sobrante / merma) es US-028 / TK-104.
 */
export class RecipePreparation {
  private readonly props: RecipePreparationProps;

  constructor(props: RecipePreparationProps) {
    if (props.plannedPortions <= 0) {
      throw new Error('Las porciones planificadas deben ser mayores que cero.');
    }
    this.props = { ...props };
  }

  public static openNew(
    id: string,
    recipeId: string,
    plannedPortions: number,
    openedByOperatorId: string | undefined,
    now: Date
  ): RecipePreparation {
    return new RecipePreparation({
      id,
      recipeId,
      plannedPortions,
      status: 'OPEN',
      openedByOperatorId,
      openedAt: now,
    });
  }

  public get id(): string {
    return this.props.id;
  }

  public get recipeId(): string {
    return this.props.recipeId;
  }

  public get plannedPortions(): number {
    return this.props.plannedPortions;
  }

  public get status(): RecipePreparationStatus {
    return this.props.status;
  }

  public get openedByOperatorId(): string | undefined {
    return this.props.openedByOperatorId;
  }

  public get openedAt(): Date {
    return this.props.openedAt;
  }

  public get actualPortions(): number | undefined {
    return this.props.actualPortions;
  }

  public get closedByOperatorId(): string | undefined {
    return this.props.closedByOperatorId;
  }

  public get closedAt(): Date | undefined {
    return this.props.closedAt;
  }

  public get notes(): string | undefined {
    return this.props.notes;
  }

  public get isOpen(): boolean {
    return this.props.status === 'OPEN';
  }

  /**
   * US-028: concilia y cierra la preparación. Guarda de estado `OPEN → CLOSED`
   * (un segundo cierre o cerrar una abandonada → 409). El cuadre por ingrediente
   * vive en `RecipePreparationItem`; aquí solo la transición del agregado.
   */
  public close(actualPortions: number, closedByOperatorId: string | undefined, now: Date): void {
    this.assertOpen();
    if (actualPortions < 0) {
      throw new Error('Las porciones reales no pueden ser negativas.');
    }
    this.props.status = 'CLOSED';
    this.props.actualPortions = actualPortions;
    this.props.closedByOperatorId = closedByOperatorId;
    this.props.closedAt = now;
  }

  /**
   * US-028 Escenario 6: cierra sin conciliar. Los remanentes vinculados quedan
   * `ACTIVE` (los desvincula el caso de uso); no se asume merma.
   */
  public abandon(closedByOperatorId: string | undefined, now: Date): void {
    this.assertOpen();
    this.props.status = 'ABANDONED';
    this.props.closedByOperatorId = closedByOperatorId;
    this.props.closedAt = now;
  }

  private assertOpen(): void {
    if (this.props.status !== 'OPEN') {
      throw new PreparationNotOpenException(this.props.id, this.props.status);
    }
  }
}
