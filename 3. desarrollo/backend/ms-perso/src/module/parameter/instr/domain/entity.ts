import { ParamsInterface } from "src/shared/util";

export interface InstrEntity {
  instr_cod_instr?: number;
  instr_nom_instr: string;
  instr_cod_seps: string;
  instr_est_instr?: boolean;
}

export interface InstrParams extends ParamsInterface {
  activo?: boolean;
}

