import { TpersEntity } from "./entity";

export class TpersValue implements TpersEntity {
  tpers_cod_tpers?: number;
  tpers_nom_tpers: string;
  tpers_est_tpers: boolean;

  constructor(data: TpersEntity) {
    this.tpers_cod_tpers = data.tpers_cod_tpers;
    this.tpers_nom_tpers = (data.tpers_nom_tpers || '').trim().toUpperCase();
    this.tpers_est_tpers = data.tpers_est_tpers ?? true;
  }

  public toJson(): TpersEntity {
    return {
      ...(this.tpers_cod_tpers ? { tpers_cod_tpers: this.tpers_cod_tpers } : {}),
      tpers_nom_tpers: this.tpers_nom_tpers,
      tpers_est_tpers: this.tpers_est_tpers,
    };
  }
}

