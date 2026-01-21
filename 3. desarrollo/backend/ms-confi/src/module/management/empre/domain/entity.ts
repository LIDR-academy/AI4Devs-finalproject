
import { ParamsInterface } from "src/shared/util";

export interface EmpreEntity {
  empre_cod_empre?: number;
  empre_nom_empre: string;
  empre_abr_empre: string;
  empre_cod_conse: string;
  empre_cta_bce: string;
}

export interface EmpreParams extends ParamsInterface { }



