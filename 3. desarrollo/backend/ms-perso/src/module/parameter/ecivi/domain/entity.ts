import { ParamsInterface } from "src/shared/util";

export interface EciviEntity {
  ecivi_cod_ecivi?: number;
  ecivi_nom_ecivi: string;
  ecivi_req_conyu: boolean;
  ecivi_est_ecivi?: boolean;
}

export interface EciviParams extends ParamsInterface {
  activo?: boolean;
}

