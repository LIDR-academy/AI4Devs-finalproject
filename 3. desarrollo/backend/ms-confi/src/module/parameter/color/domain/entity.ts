import { ParamsInterface } from "src/shared/util";

export interface ColorEntity {
  color_cod_color?: number;
  color_des_color: string;
  color_cod_hexdc: string;
}

export interface ColorParams extends ParamsInterface { }
