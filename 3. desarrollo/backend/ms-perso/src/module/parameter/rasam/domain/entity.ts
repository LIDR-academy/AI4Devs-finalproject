import { ParamsInterface } from "src/shared/util";

export interface RasamEntity {
  rasam_cod_rasam?: number;
  rasam_nom_rasam: string;
  rasam_est_rasam?: boolean;
}

export interface RasamParams extends ParamsInterface {
  activo?: boolean;
}

