export interface ConsumptionReasonProps {
  id: string;
  label: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * ADR-004 / US-030: catálogo administrable de motivos de consumo — usado por el
 * consumo manual de remanentes (US-004) y la varianza negativa de conciliación de
 * turno (US-008). Se desactiva, nunca se borra: un motivo ya referenciado por
 * movimientos históricos no puede desaparecer sin romper la trazabilidad que
 * justamente busca este catálogo.
 */
export class ConsumptionReason {
  private readonly props: ConsumptionReasonProps;

  constructor(props: ConsumptionReasonProps) {
    if (!props.label.trim()) {
      throw new Error('La etiqueta del motivo no puede estar vacía.');
    }
    this.props = { ...props };
  }

  public static create(id: string, label: string): ConsumptionReason {
    return new ConsumptionReason({ id, label, isActive: true });
  }

  public get id(): string {
    return this.props.id;
  }

  public get label(): string {
    return this.props.label;
  }

  public get isActive(): boolean {
    return this.props.isActive;
  }

  public get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  public get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  public rename(label: string): void {
    if (!label.trim()) {
      throw new Error('La etiqueta del motivo no puede estar vacía.');
    }
    this.props.label = label;
  }

  public activate(): void {
    this.props.isActive = true;
  }

  public deactivate(): void {
    this.props.isActive = false;
  }
}
