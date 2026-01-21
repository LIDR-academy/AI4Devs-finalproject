import { AuthEntity } from "./entity";

export class AuthValue implements AuthEntity {
    usuar_cod_usuar: number;
    usuar_cod_perso: number;
    usuar_cod_perfi: number;
    perso_nom_rzsoc: string;
    usuar_nom_usuar: string;
    usuar_psw_usuar: string;
    usuar_dir_corre: string;
    usuar_est_usuar: string;

    constructor(data: AuthEntity) {
        this.usuar_cod_usuar = data.usuar_cod_usuar;
        this.usuar_cod_perso = data.usuar_cod_perso;
        this.usuar_cod_perfi = data.usuar_cod_perfi;
        this.perso_nom_rzsoc = data.perso_nom_rzsoc;
        this.usuar_nom_usuar = data.usuar_nom_usuar;
        this.usuar_psw_usuar = data.usuar_psw_usuar;
        this.usuar_dir_corre = data.usuar_dir_corre;
        this.usuar_est_usuar = data.usuar_est_usuar;
    }

    public toJson(): AuthEntity {
        return {
            usuar_cod_usuar: this.usuar_cod_usuar,
            usuar_cod_perso: this.usuar_cod_perso,
            usuar_cod_perfi: this.usuar_cod_perfi,
            perso_nom_rzsoc: this.perso_nom_rzsoc,
            usuar_nom_usuar: this.usuar_nom_usuar,
            usuar_psw_usuar: this.usuar_psw_usuar,
            usuar_dir_corre: this.usuar_dir_corre,
            usuar_est_usuar: this.usuar_est_usuar,
        };
    }

}