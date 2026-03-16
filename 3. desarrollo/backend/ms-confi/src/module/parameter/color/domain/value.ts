import { ColorEntity } from "./entity";

export class ColorValue implements ColorEntity {
    color_cod_color?: number;
    color_des_color: string;
    color_cod_hexdc: string;

    constructor(data: ColorEntity, id?: number) {
        this.color_cod_color = id ?? data.color_cod_color;
        this.color_des_color = data.color_des_color;
        this.color_cod_hexdc = data.color_cod_hexdc;
    }

    public toJson(): ColorEntity {
        return {
            ...(this.color_cod_color ? { color_cod_color: this.color_cod_color } : {}),
            color_des_color: this.color_des_color,
            color_cod_hexdc: this.color_cod_hexdc,
        };
    }

}