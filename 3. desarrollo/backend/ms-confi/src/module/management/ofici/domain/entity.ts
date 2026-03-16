
import { ParamsInterface } from "src/shared/util";

export interface OficiEntity {
  // Atributos
  ofici_cod_ofici?: number;
  ofici_nom_ofici: string;
  ofici_dir_ofici: string;

  // Relaciones
  ofici_cod_empre: number;
  empre_nom_empre?: string;

  ofici_cod_tofic: number;
  tofic_des_tofic?: string;
}

export interface OficiParams extends ParamsInterface {
  id_empre: number;
}



