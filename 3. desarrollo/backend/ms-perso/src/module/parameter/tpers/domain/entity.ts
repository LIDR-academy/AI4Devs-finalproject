import { ParamsInterface } from "src/shared/util";

export interface TpersEntity {
  tpers_cod_tpers?: number;
  tpers_nom_tpers: string;
  tpers_est_tpers?: boolean;
}

export interface TpersParams extends ParamsInterface {
  activo?: boolean;
}

