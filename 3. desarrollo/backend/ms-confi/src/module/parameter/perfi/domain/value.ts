import { PerfiEntity } from "./entity";

export class PerfiValue implements PerfiEntity {
    perfi_cod_perfi?: number;
    perfi_des_perfi: string;

    constructor(data: PerfiEntity, id?: number) {
        this.perfi_cod_perfi = id ?? data.perfi_cod_perfi;
        this.perfi_des_perfi = data.perfi_des_perfi;
    }

    public toJson(): PerfiEntity {
        return {
            ...(this.perfi_cod_perfi ? { perfi_cod_perfi: this.perfi_cod_perfi } : {}),
            perfi_des_perfi: this.perfi_des_perfi,
        };
    }

}