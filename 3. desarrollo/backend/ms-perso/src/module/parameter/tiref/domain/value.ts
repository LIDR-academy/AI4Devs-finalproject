import { TirefEntity } from "./entity";

export class TirefValue implements TirefEntity {
  tiref_cod_tiref?: number;
  tiref_nom_tiref: string;
  tiref_req_finan: boolean;
  tiref_est_tiref: boolean;

  constructor(data: TirefEntity) {
    this.tiref_cod_tiref = data.tiref_cod_tiref;
    this.tiref_nom_tiref = (data.tiref_nom_tiref || '').trim().toUpperCase();
    this.tiref_req_finan = data.tiref_req_finan ?? false;
    this.tiref_est_tiref = data.tiref_est_tiref ?? true;
  }

  public toJson(): TirefEntity {
    return {
      ...(this.tiref_cod_tiref ? { tiref_cod_tiref: this.tiref_cod_tiref } : {}),
      tiref_nom_tiref: this.tiref_nom_tiref,
      tiref_req_finan: this.tiref_req_finan,
      tiref_est_tiref: this.tiref_est_tiref,
    };
  }
}

