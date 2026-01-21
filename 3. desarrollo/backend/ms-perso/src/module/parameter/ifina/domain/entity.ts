import { ParamsInterface } from "src/shared/util";

export interface IfinaEntity {
  ifina_cod_ifina?: number;
  ifina_nom_ifina: string;
  ifina_cod_spi?: string | null;
  ifina_est_ifina?: boolean;
}

export interface IfinaParams extends ParamsInterface {
  activo?: boolean;
}

