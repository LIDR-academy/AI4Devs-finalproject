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
}
