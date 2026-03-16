import { NacioEntity } from "./entity";

export class NacioValue implements NacioEntity {
  nacio_cod_nacio?: number;
  nacio_nom_nacio: string;
  nacio_cod_pais: string;
  nacio_est_nacio: boolean;

  constructor(data: NacioEntity) {
    this.nacio_cod_nacio = data.nacio_cod_nacio;
    this.nacio_nom_nacio = (data.nacio_nom_nacio || '').trim().toUpperCase();
    this.nacio_cod_pais = (data.nacio_cod_pais || '').trim().toUpperCase();
    this.nacio_est_nacio = data.nacio_est_nacio ?? true;
  }

  public toJson(): NacioEntity {
    return {
      ...(this.nacio_cod_nacio ? { nacio_cod_nacio: this.nacio_cod_nacio } : {}),
      nacio_nom_nacio: this.nacio_nom_nacio,
      nacio_cod_pais: this.nacio_cod_pais,
      nacio_est_nacio: this.nacio_est_nacio,
    };
  }
}

