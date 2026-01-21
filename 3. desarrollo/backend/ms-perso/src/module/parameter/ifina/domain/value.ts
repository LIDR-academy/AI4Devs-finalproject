import { IfinaEntity } from "./entity";

export class IfinaValue implements IfinaEntity {
  ifina_cod_ifina?: number;
  ifina_nom_ifina: string;
  ifina_cod_spi?: string | null;
  ifina_est_ifina: boolean;

  constructor(data: IfinaEntity) {
    this.ifina_cod_ifina = data.ifina_cod_ifina;
    this.ifina_nom_ifina = (data.ifina_nom_ifina || '').trim().toUpperCase();
    this.ifina_cod_spi = data.ifina_cod_spi ? (data.ifina_cod_spi || '').trim().toUpperCase() : null;
    this.ifina_est_ifina = data.ifina_est_ifina ?? true;
  }

  public toJson(): IfinaEntity {
    return {
      ...(this.ifina_cod_ifina ? { ifina_cod_ifina: this.ifina_cod_ifina } : {}),
      ifina_nom_ifina: this.ifina_nom_ifina,
      ifina_cod_spi: this.ifina_cod_spi,
      ifina_est_ifina: this.ifina_est_ifina,
    };
  }
}

