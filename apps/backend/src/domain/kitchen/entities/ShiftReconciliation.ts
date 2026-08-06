import { DecimalQuantity } from '../../stock/value-objects/DecimalQuantity.js';
import Decimal from 'decimal.js';

export interface ShiftReconciliationItem {
  remanenteId: string;
  insumoId: string;
  physicalQuantity: DecimalQuantity;
  theoreticalQuantity: DecimalQuantity;
  variance: Decimal;
}

export interface ShiftReconciliationProps {
  id: string;
  shiftDate: Date;
  operatorId: string;
  notes?: string;
  items: ShiftReconciliationItem[];
  createdAt?: Date;
}

export class ShiftReconciliation {
  private readonly props: ShiftReconciliationProps;

  constructor(props: ShiftReconciliationProps) {
    this.props = {
      ...props,
      createdAt: props.createdAt ?? new Date(),
    };
  }

  public get id(): string {
    return this.props.id;
  }

  public get shiftDate(): Date {
    return this.props.shiftDate;
  }

  public get operatorId(): string {
    return this.props.operatorId;
  }

  public get notes(): string | undefined {
    return this.props.notes;
  }

  public get items(): ShiftReconciliationItem[] {
    return [...this.props.items];
  }

  public get createdAt(): Date {
    return this.props.createdAt!;
  }
}
