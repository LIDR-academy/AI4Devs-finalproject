import { ParamsInterface } from "src/shared/util";

export interface TirefEntity {
  tiref_cod_tiref?: number;
  tiref_nom_tiref: string;
  tiref_req_finan: boolean;
  tiref_est_tiref?: boolean;
}

export interface TirefParams extends ParamsInterface {
  activo?: boolean;
}

