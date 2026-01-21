import { ParamsInterface } from "src/shared/util";

export interface TcontEntity {
  tcont_cod_tcont?: number;
  tcont_nom_tcont: string;
  tcont_est_tcont?: boolean;
}

export interface TcontParams extends ParamsInterface {
  activo?: boolean;
}

