import { TrepEntity } from "./entity";

export class TrepValue implements TrepEntity {
  trep_cod_trep?: number;
  trep_nom_trep: string;
  trep_est_trep: boolean;

  constructor(data: TrepEntity) {
    this.trep_cod_trep = data.trep_cod_trep;
    this.trep_nom_trep = (data.trep_nom_trep || '').trim().toUpperCase();
    this.trep_est_trep = data.trep_est_trep ?? true;
  }

  public toJson(): TrepEntity {
    return {
      ...(this.trep_cod_trep ? { trep_cod_trep: this.trep_cod_trep } : {}),
      trep_nom_trep: this.trep_nom_trep,
      trep_est_trep: this.trep_est_trep,
    };
  }
}

