export interface SystemSettingsProps {
  id: string;
  restaurantName: string;
  taxId?: string;
  currencySymbol: string;
  criticalAlertHours: number;
  defaultRemanenteHours: number;
  varianceTolerancePercent: number;
  idleTimeoutMinutes: number;
  /** US-029 / ADR-003: umbral de merma de preparación destacado en el reporte (TK-105). */
  preparationWasteAlertPercent: number;
  updatedAt?: Date;
}

export class SystemSettings {
  constructor(private readonly props: SystemSettingsProps) {}

  get id(): string {
    return this.props.id;
  }

  get restaurantName(): string {
    return this.props.restaurantName;
  }

  get taxId(): string | undefined {
    return this.props.taxId;
  }

  get currencySymbol(): string {
    return this.props.currencySymbol;
  }

  get criticalAlertHours(): number {
    return this.props.criticalAlertHours;
  }

  get defaultRemanenteHours(): number {
    return this.props.defaultRemanenteHours;
  }

  get varianceTolerancePercent(): number {
    return this.props.varianceTolerancePercent;
  }

  get idleTimeoutMinutes(): number {
    return this.props.idleTimeoutMinutes;
  }

  get preparationWasteAlertPercent(): number {
    return this.props.preparationWasteAlertPercent;
  }
}

