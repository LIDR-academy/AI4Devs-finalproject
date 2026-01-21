import { ParamsInterface } from "src/shared/util";

export interface IconsEntity {
  icons_cod_icons?: number;
  icons_cod_color: number;
  icons_des_color?: string;
  icons_des_icons: string;
  icons_cod_html: string;
}

export interface IconsParams extends ParamsInterface { }
