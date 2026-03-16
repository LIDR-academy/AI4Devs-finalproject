import { OpcioEntity } from "./entity";

export class OpcioValue implements OpcioEntity {
    opcio_cod_opcio?: string;
    opcio_des_opcio: string;
    opcio_www_opcio: string;
    opcio_cod_padre: string;
    opcio_est_opcio: string;

    // Llave foránea
    opcio_cod_icons: number;
    icons_cod_html?: string;

    constructor(data: OpcioEntity, id?: string) {
        this.opcio_cod_opcio = id ?? data.opcio_cod_opcio;
        this.opcio_des_opcio = data.opcio_des_opcio;
        this.opcio_www_opcio = data.opcio_www_opcio;
        this.opcio_cod_padre = data.opcio_cod_padre;
        this.opcio_est_opcio = data.opcio_est_opcio.toUpperCase();
        this.opcio_cod_icons = data.opcio_cod_icons;
        this.icons_cod_html = data.icons_cod_html;
    }

    public toJson(): OpcioEntity {
        return {
            ...(this.opcio_cod_opcio ? { opcio_cod_opcio: this.opcio_cod_opcio } : {}),
            opcio_des_opcio: this.opcio_des_opcio,
            opcio_www_opcio: this.opcio_www_opcio,
            opcio_cod_padre: this.opcio_cod_padre,
            opcio_est_opcio: this.opcio_est_opcio,
            opcio_cod_icons: this.opcio_cod_icons,
            ...(this.opcio_cod_icons ? { icons_cod_html: this.icons_cod_html } : {}),
        };
    }

}