import { IconsEntity } from "./entity";

export class IconsValue implements IconsEntity {
    icons_cod_icons?: number;
    icons_cod_color: number;
    icons_des_color?: string;
    icons_des_icons: string;
    icons_cod_html: string;
    constructor(data: IconsEntity, id?: number) {
        this.icons_cod_icons = id ?? data.icons_cod_icons;
        this.icons_cod_color = data.icons_cod_color;
        this.icons_des_color = data.icons_des_color;
        this.icons_des_icons = data.icons_des_icons;
        this.icons_cod_html = data.icons_cod_html;
    }

    public toJson(): IconsEntity {
        return {
            ...(this.icons_cod_icons ? { icons_cod_icons: this.icons_cod_icons } : {}),
            icons_des_icons: this.icons_des_icons,
            icons_cod_color: this.icons_cod_color,
            ...(this.icons_des_color ? { icons_des_color: this.icons_des_color } : {}),
            icons_cod_html: this.icons_cod_html,
        };
    }

}