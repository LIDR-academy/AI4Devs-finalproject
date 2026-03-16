import { TcontEntity } from "./entity";

export class TcontValue implements TcontEntity {
  tcont_cod_tcont?: number;
  tcont_nom_tcont: string;
  tcont_est_tcont: boolean;

  constructor(data: TcontEntity) {
    this.tcont_cod_tcont = data.tcont_cod_tcont;
    this.tcont_nom_tcont = (data.tcont_nom_tcont || '').trim().toUpperCase();
    this.tcont_est_tcont = data.tcont_est_tcont ?? true;
  }

  public toJson(): TcontEntity {
    return {
      ...(this.tcont_cod_tcont ? { tcont_cod_tcont: this.tcont_cod_tcont } : {}),
      tcont_nom_tcont: this.tcont_nom_tcont,
      tcont_est_tcont: this.tcont_est_tcont,
    };
  }
}

