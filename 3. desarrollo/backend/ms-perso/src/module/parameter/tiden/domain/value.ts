import { TidenEntity } from "./entity";

export class TidenValue implements TidenEntity {
    tiden_cod_tiden?: number;
    tiden_nom_tiden: string;
    tiden_lon_minim: number;
    tiden_lon_maxim: number;
    tiden_est_tiden: boolean;

    constructor(data: TidenEntity) {
        this.tiden_cod_tiden = data.tiden_cod_tiden;
        this.tiden_nom_tiden = (data.tiden_nom_tiden || '').trim().toUpperCase();
        this.tiden_lon_minim = data.tiden_lon_minim ?? 5;
        this.tiden_lon_maxim = data.tiden_lon_maxim ?? 20;
        this.tiden_est_tiden = data.tiden_est_tiden ?? true;
    }

    public toJson(): TidenEntity {
        return {
            ...(this.tiden_cod_tiden ? { tiden_cod_tiden: this.tiden_cod_tiden } : {}),
            tiden_nom_tiden: this.tiden_nom_tiden,
            tiden_lon_minim: this.tiden_lon_minim,
            tiden_lon_maxim: this.tiden_lon_maxim,
            tiden_est_tiden: this.tiden_est_tiden,
        };
    }

}