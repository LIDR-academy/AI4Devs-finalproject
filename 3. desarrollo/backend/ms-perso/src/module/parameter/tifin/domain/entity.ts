import { ParamsInterface } from "src/shared/util";

export interface TifinEntity {
  tifin_cod_tifin?: number;
  tifin_nom_tifin: string;
  tifin_tip_tifin: 'I' | 'G' | 'A' | 'P';
  tifin_est_tifin?: boolean;
}

export interface TifinParams extends ParamsInterface {
  activo?: boolean;
  tipo?: 'I' | 'G' | 'A' | 'P';
}

