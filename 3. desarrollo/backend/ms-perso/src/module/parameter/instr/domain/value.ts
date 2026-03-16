import { InstrEntity } from "./entity";

export class InstrValue implements InstrEntity {
  instr_cod_instr?: number;
  instr_nom_instr: string;
  instr_cod_seps: string;
  instr_est_instr: boolean;

  constructor(data: InstrEntity) {
    this.instr_cod_instr = data.instr_cod_instr;
    this.instr_nom_instr = (data.instr_nom_instr || '').trim().toUpperCase();
    this.instr_cod_seps = (data.instr_cod_seps || '').trim();
    this.instr_est_instr = data.instr_est_instr ?? true;
  }

  public toJson(): InstrEntity {
    return {
      ...(this.instr_cod_instr ? { instr_cod_instr: this.instr_cod_instr } : {}),
      instr_nom_instr: this.instr_nom_instr,
      instr_cod_seps: this.instr_cod_seps,
      instr_est_instr: this.instr_est_instr,
    };
  }
}

