import { ParamsInterface } from "src/shared/util";

export interface TrepEntity {
  trep_cod_trep?: number;
  trep_nom_trep: string;
  trep_est_trep?: boolean;
}

export interface TrepParams extends ParamsInterface {
  activo?: boolean;
}

