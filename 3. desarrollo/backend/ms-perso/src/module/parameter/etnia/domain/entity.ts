import { ParamsInterface } from "src/shared/util";

export interface EtniaEntity {
  etnia_cod_etnia?: number;
  etnia_nom_etnia: string;
  etnia_cod_seps: string;
  etnia_est_etnia?: boolean;
}

export interface EtniaParams extends ParamsInterface {
  activo?: boolean;
}

