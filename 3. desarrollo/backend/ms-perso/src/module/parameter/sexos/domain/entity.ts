import { ParamsInterface } from "src/shared/util";

export interface SexosEntity {
  sexos_cod_sexos?: number;
  sexos_nom_sexos: string;
  sexos_cod_seps: string;
  sexos_est_sexos?: boolean;
}

export interface SexosParams extends ParamsInterface {
  activo?: boolean;
}

