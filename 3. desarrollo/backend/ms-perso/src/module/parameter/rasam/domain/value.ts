import { RasamEntity } from "./entity";

export class RasamValue implements RasamEntity {
  rasam_cod_rasam?: number;
  rasam_nom_rasam: string;
  rasam_est_rasam: boolean;

  constructor(data: RasamEntity) {
    this.rasam_cod_rasam = data.rasam_cod_rasam;
    this.rasam_nom_rasam = (data.rasam_nom_rasam || '').trim().toUpperCase();
    this.rasam_est_rasam = data.rasam_est_rasam ?? true;
  }

  public toJson(): RasamEntity {
    return {
      ...(this.rasam_cod_rasam ? { rasam_cod_rasam: this.rasam_cod_rasam } : {}),
      rasam_nom_rasam: this.rasam_nom_rasam,
      rasam_est_rasam: this.rasam_est_rasam,
    };
  }
}

