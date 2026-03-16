import { ParamsInterface } from "src/shared/util";

export interface ToficEntity {
  tofic_cod_tofic?: number;
  tofic_des_tofic: string;
  tofic_abr_tofic: string;
}

export interface ToficParams extends ParamsInterface { }
