import { ParamsInterface } from "src/shared/util";

export interface TidenEntity {
  tiden_cod_tiden?: number;
  tiden_nom_tiden: string;
  tiden_lon_minim: number;
  tiden_lon_maxim: number;
  tiden_est_tiden?: boolean;
}

export interface TidenParams extends ParamsInterface {
  activo?: boolean;
}
