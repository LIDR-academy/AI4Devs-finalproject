import { DecimalQuantity } from '../../stock/value-objects/DecimalQuantity.js';

export interface WasteSummaryProps {
  insumoId: string;
  insumoName: string;
  unitOfMeasure: string;
  totalDiscardedQuantity: DecimalQuantity;
  reason: string;
}

export class WasteSummary {
  private readonly props: WasteSummaryProps;

  constructor(props: WasteSummaryProps) {
    this.props = { ...props };
  }

  public get insumoId(): string {
    return this.props.insumoId;
  }

  public get insumoName(): string {
    return this.props.insumoName;
  }

  public get unitOfMeasure(): string {
    return this.props.unitOfMeasure;
  }

  public get totalDiscardedQuantity(): DecimalQuantity {
    return this.props.totalDiscardedQuantity;
  }

  public get reason(): string {
    return this.props.reason;
  }
}
