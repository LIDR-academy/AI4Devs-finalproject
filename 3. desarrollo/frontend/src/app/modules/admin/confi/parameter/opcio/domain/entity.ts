import { ParamsInterface } from "app/shared/utils";



export interface OpcioEntity {
  opcio_cod_opcio?: string;
  opcio_des_opcio: string;
  opcio_www_opcio: string;
  opcio_cod_padre: string;
  opcio_est_opcio: string;

  // Llave foránea
  opcio_cod_icons: number;
  icons_cod_html?: string;
  opcio_men_opcio?: OpcioEntity[];
}

export interface OpcioParams extends ParamsInterface { }


