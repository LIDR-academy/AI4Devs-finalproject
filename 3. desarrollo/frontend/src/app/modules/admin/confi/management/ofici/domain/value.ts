import { OficiEntity } from "./entity";

export class OficiValue implements OficiEntity {
    // Atributos
    ofici_cod_ofici?: number;
    ofici_nom_ofici: string;
    ofici_dir_ofici: string;

    // Relaciones
    ofici_cod_empre: number;
    empre_nom_empre?: string;

    ofici_cod_tofic: number;
    tofic_des_tofic?: string;

    constructor(data: OficiEntity, id?: number) {
        this.ofici_cod_ofici = id ?? data.ofici_cod_ofici;
        this.ofici_nom_ofici = data.ofici_nom_ofici;
        this.ofici_cod_empre = data.ofici_cod_empre;
        this.empre_nom_empre = data.empre_nom_empre;
        this.ofici_dir_ofici = data.ofici_dir_ofici;
        this.ofici_cod_tofic = data.ofici_cod_tofic;
        this.tofic_des_tofic = data.tofic_des_tofic;
    }

    public toBaseFields(): OficiEntity {
        return {
            ofici_nom_ofici: this.ofici_nom_ofici,
            ofici_dir_ofici: this.ofici_dir_ofici,
            ofici_cod_empre: this.ofici_cod_empre,
            ofici_cod_tofic: this.ofici_cod_tofic,
        };
    }


    public toJson(): OficiEntity {
        return {
            // Atributos
            ...(this.ofici_cod_ofici ? { ofici_cod_ofici: this.ofici_cod_ofici } : {}),
            ofici_nom_ofici: this.ofici_nom_ofici,
            ofici_dir_ofici: this.ofici_dir_ofici,
            // Relaciones
            ofici_cod_empre: this.ofici_cod_empre,
            ...(this.ofici_cod_empre ? { empre_nom_empre: this.empre_nom_empre } : {}),
            ofici_cod_tofic: this.ofici_cod_tofic,
            ...(this.ofici_cod_tofic ? { tofic_des_tofic: this.tofic_des_tofic } : {})

        };
    }

}
