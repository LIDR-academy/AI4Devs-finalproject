import { EtniaEntity } from "./entity";

export class EtniaValue implements EtniaEntity {
  etnia_cod_etnia?: number;
  etnia_nom_etnia: string;
  etnia_cod_seps: string;
  etnia_est_etnia: boolean;

  constructor(data: EtniaEntity) {
    this.etnia_cod_etnia = data.etnia_cod_etnia;
    this.etnia_nom_etnia = (data.etnia_nom_etnia || '').trim().toUpperCase();
    this.etnia_cod_seps = (data.etnia_cod_seps || '').trim();
    this.etnia_est_etnia = data.etnia_est_etnia ?? true;
  }

  public toJson(): EtniaEntity {
    return {
      ...(this.etnia_cod_etnia ? { etnia_cod_etnia: this.etnia_cod_etnia } : {}),
      etnia_nom_etnia: this.etnia_nom_etnia,
      etnia_cod_seps: this.etnia_cod_seps,
      etnia_est_etnia: this.etnia_est_etnia,
    };
  }
}

