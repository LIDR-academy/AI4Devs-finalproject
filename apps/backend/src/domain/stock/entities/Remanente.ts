import { DecimalQuantity } from '../value-objects/DecimalQuantity.js';
import { ExcessConsumptionException } from '../../kitchen/errors/ExcessConsumptionException.js';

export type RemanenteStatusType = 'ACTIVE' | 'EXHAUSTED' | 'DISCARDED';

export interface RemanenteProps {
  id: string;
  insumoId: string;
  currentQuantity: DecimalQuantity;
  initialQuantity: DecimalQuantity;
  location: string;
  status: RemanenteStatusType;
  expirationDate: Date;
  createdAt?: Date;
}

export class Remanente {
  private readonly props: RemanenteProps;

  constructor(props: RemanenteProps) {
    this.props = { ...props };
  }

  public static createNew(
    id: string,
    insumoId: string,
    quantity: DecimalQuantity,
    location: string = 'KITCHEN_FRIDGE',
    hoursToExpire: number = 24
  ): Remanente {
    const now = new Date();
    const expirationDate = new Date(now.getTime() + hoursToExpire * 60 * 60 * 1000);

    return new Remanente({
      id,
      insumoId,
      currentQuantity: quantity,
      initialQuantity: quantity,
      location,
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

  public get status(): RemanenteStatusType {
    return this.props.status;
  }

  public get expirationDate(): Date {
    return this.props.expirationDate;
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

    if (remaining.toNumber() === 0) {
      this.props.status = 'EXHAUSTED';
    }
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

    return discardedQuantity;
  }
}
