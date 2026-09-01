import { DecimalQuantity } from '../value-objects/DecimalQuantity.js';

export interface InsumoProps {
  id: string;
  name: string;
  unitOfMeasure: string;
  warehouseStock: DecimalQuantity;
  unitCost?: DecimalQuantity;
}

export class Insumo {
  private readonly props: InsumoProps;

  constructor(props: InsumoProps) {
    this.props = { ...props };
  }

  public get id(): string {
    return this.props.id;
  }

  public get name(): string {
    return this.props.name;
  }

  public get unitOfMeasure(): string {
    return this.props.unitOfMeasure;
  }

  public get warehouseStock(): DecimalQuantity {
    return this.props.warehouseStock;
  }

  public get unitCost(): DecimalQuantity | undefined {
    return this.props.unitCost;
  }

  public hasSufficientStock(requested: DecimalQuantity): boolean {
    return this.props.warehouseStock.isGreaterThanOrEqualTo(requested);
  }

  public deductStock(quantity: DecimalQuantity): void {
    this.props.warehouseStock = this.props.warehouseStock.subtract(quantity);
  }

  public increaseStock(quantity: DecimalQuantity): void {
    this.props.warehouseStock = this.props.warehouseStock.add(quantity);
  }
}
