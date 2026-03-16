import { EmpreEntity } from "./entity";

export class EmpreValue implements EmpreEntity {
    empre_cod_empre?: number;
    empre_nom_empre: string;
    empre_abr_empre: string;
    empre_cod_conse: string;
    empre_cta_bce: string;

    constructor(data: EmpreEntity, id?: number) {
        this.empre_cod_empre = id ?? data.empre_cod_empre;
        this.empre_nom_empre = data.empre_nom_empre;
        this.empre_abr_empre = data.empre_abr_empre.toLocaleUpperCase();
        this.empre_cod_conse = data.empre_cod_conse;
        this.empre_cta_bce = data.empre_cta_bce;
    }

    public toJson(): EmpreEntity {
        return {
            ...(this.empre_cod_empre ? { empre_cod_empre: this.empre_cod_empre } : {}),
            empre_nom_empre: this.empre_nom_empre,
            empre_abr_empre: this.empre_abr_empre,
            empre_cod_conse: this.empre_cod_conse,
            empre_cta_bce: this.empre_cta_bce,
        };
    }

}
