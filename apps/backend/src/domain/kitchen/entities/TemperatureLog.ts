import { Temperature } from '../value-objects/Temperature.js';

export type TemperatureUnitType = 'REFRIGERATOR' | 'FREEZER';

/**
 * US-033: umbral seguro estándar de la industria (FDA Food Code) — decisión de negocio
 * confirmada con el humano como valor fijo, no configurable por `SystemSettings` en este
 * alcance. REFRIGERATOR <= 4.00°C, FREEZER <= -18.00°C.
 */
const SAFE_THRESHOLDS_CELSIUS: Record<TemperatureUnitType, Temperature> = {
  REFRIGERATOR: new Temperature('4.00'),
  FREEZER: new Temperature('-18.00'),
};

export interface TemperatureLogProps {
  id: string;
  storageLocationId: string;
  unitType: TemperatureUnitType;
  temperatureCelsius: Temperature;
  recordedByUserId: string;
  recordedAt?: Date;
}

/**
 * US-033/TK-120: registro manual (sin sensor, Non-Goal #4 del PRD) de la temperatura de
 * un sub-sector al iniciar turno. `isWithinSafeRange` se calcula aquí, en el dominio —
 * nunca en el controller ni en una query SQL — para que un futuro segundo punto de
 * entrada (ej. import batch) no pueda calcular el umbral de forma distinta (mitigación
 * de riesgo explícita del ticket). Un valor fuera de rango NUNCA bloquea la creación del
 * registro — solo se refleja en este campo, para visibilidad en el reporte de auditoría.
 */
export class TemperatureLog {
  private readonly props: TemperatureLogProps;

  constructor(props: TemperatureLogProps) {
    this.props = { ...props, recordedAt: props.recordedAt ?? new Date() };
  }

  public get id(): string {
    return this.props.id;
  }

  public get storageLocationId(): string {
    return this.props.storageLocationId;
  }

  public get unitType(): TemperatureUnitType {
    return this.props.unitType;
  }

  public get temperatureCelsius(): Temperature {
    return this.props.temperatureCelsius;
  }

  public get recordedByUserId(): string {
    return this.props.recordedByUserId;
  }

  public get recordedAt(): Date {
    return this.props.recordedAt!;
  }

  public get isWithinSafeRange(): boolean {
    return this.props.temperatureCelsius.isLessThanOrEqualTo(SAFE_THRESHOLDS_CELSIUS[this.props.unitType]);
  }
}
