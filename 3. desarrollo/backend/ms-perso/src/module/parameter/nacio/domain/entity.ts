import { ParamsInterface } from "src/shared/util";

export interface NacioEntity {
  nacio_cod_nacio?: number;
  nacio_nom_nacio: string;
  nacio_cod_pais: string;
  nacio_est_nacio?: boolean;
}

export interface NacioParams extends ParamsInterface {
  activo?: boolean;
}

