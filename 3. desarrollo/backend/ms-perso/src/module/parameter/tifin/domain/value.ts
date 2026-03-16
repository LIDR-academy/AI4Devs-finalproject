import { TifinEntity } from "./entity";

export class TifinValue implements TifinEntity {
  tifin_cod_tifin?: number;
  tifin_nom_tifin: string;
  tifin_tip_tifin: 'I' | 'G' | 'A' | 'P';
  tifin_est_tifin: boolean;

  constructor(data: TifinEntity) {
    this.tifin_cod_tifin = data.tifin_cod_tifin;
    this.tifin_nom_tifin = (data.tifin_nom_tifin || '').trim().toUpperCase();
    this.tifin_tip_tifin = data.tifin_tip_tifin.toUpperCase() as 'I' | 'G' | 'A' | 'P';
    this.tifin_est_tifin = data.tifin_est_tifin ?? true;
  }

  public toJson(): TifinEntity {
    return {
      ...(this.tifin_cod_tifin ? { tifin_cod_tifin: this.tifin_cod_tifin } : {}),
      tifin_nom_tifin: this.tifin_nom_tifin,
      tifin_tip_tifin: this.tifin_tip_tifin,
      tifin_est_tifin: this.tifin_est_tifin,
    };
  }
}

