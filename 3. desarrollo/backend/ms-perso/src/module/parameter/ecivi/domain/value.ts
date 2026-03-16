import { EciviEntity } from "./entity";

export class EciviValue implements EciviEntity {
  ecivi_cod_ecivi?: number;
  ecivi_nom_ecivi: string;
  ecivi_req_conyu: boolean;
  ecivi_est_ecivi: boolean;

  constructor(data: EciviEntity) {
    this.ecivi_cod_ecivi = data.ecivi_cod_ecivi;
    this.ecivi_nom_ecivi = (data.ecivi_nom_ecivi || '').trim().toUpperCase();
    this.ecivi_req_conyu = data.ecivi_req_conyu ?? false;
    this.ecivi_est_ecivi = data.ecivi_est_ecivi ?? true;
  }

  public toJson(): EciviEntity {
    return {
      ...(this.ecivi_cod_ecivi ? { ecivi_cod_ecivi: this.ecivi_cod_ecivi } : {}),
      ecivi_nom_ecivi: this.ecivi_nom_ecivi,
      ecivi_req_conyu: this.ecivi_req_conyu,
      ecivi_est_ecivi: this.ecivi_est_ecivi,
    };
  }
}

