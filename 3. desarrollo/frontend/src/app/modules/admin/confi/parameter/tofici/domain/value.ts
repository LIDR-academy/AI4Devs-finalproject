import { ToficEntity } from "./entity";

export class ToficValue implements ToficEntity {
    tofic_cod_tofic?: number;
    tofic_des_tofic: string;
    tofic_abr_tofic: string;

    constructor(data: ToficEntity, id?: number) {
        this.tofic_des_tofic = data.tofic_des_tofic;
        this.tofic_abr_tofic = data.tofic_abr_tofic;
    }

    public toJson(): ToficEntity {
        return {
            ...(this.tofic_cod_tofic ? { tofic_cod_tofic: this.tofic_cod_tofic } : {}),
            tofic_des_tofic: this.tofic_des_tofic,
            tofic_abr_tofic: this.tofic_abr_tofic,
        };
    }

}
