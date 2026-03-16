import { SexosEntity } from "./entity";

export class SexosValue implements SexosEntity {
  sexos_cod_sexos?: number;
  sexos_nom_sexos: string;
  sexos_cod_seps: string;
  sexos_est_sexos: boolean;

  constructor(data: SexosEntity) {
    this.sexos_cod_sexos = data.sexos_cod_sexos;
    this.sexos_nom_sexos = (data.sexos_nom_sexos || '').trim().toUpperCase();
    this.sexos_cod_seps = (data.sexos_cod_seps || '').trim().toUpperCase();
    this.sexos_est_sexos = data.sexos_est_sexos ?? true;
  }

  public toJson(): SexosEntity {
    return {
      ...(this.sexos_cod_sexos ? { sexos_cod_sexos: this.sexos_cod_sexos } : {}),
      sexos_nom_sexos: this.sexos_nom_sexos,
      sexos_cod_seps: this.sexos_cod_seps,
      sexos_est_sexos: this.sexos_est_sexos,
    };
  }
}

