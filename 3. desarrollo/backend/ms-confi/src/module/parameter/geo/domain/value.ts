import { ProvinciaEntity, CantonEntity, ParroquiaEntity } from "./entity";

/**
 * Value object para Provincia
 */
export class ProvinciaValue implements ProvinciaEntity {
  provi_cod_provi?: number;
  provi_cod_prov: string;
  provi_nom_provi: string;
  provi_flg_acti: boolean;
  provi_fec_creac?: Date;
  provi_fec_modif?: Date;
  provi_fec_elimi?: Date | null;

  constructor(data: ProvinciaEntity, id?: number) {
    this.provi_cod_provi = id ?? data.provi_cod_provi;
    this.provi_cod_prov = data.provi_cod_prov.trim().padStart(2, '0'); // Preservar ceros a la izquierda
    this.provi_nom_provi = data.provi_nom_provi.trim();
    this.provi_flg_acti = data.provi_flg_acti ?? true;
    this.provi_fec_creac = data.provi_fec_creac;
    this.provi_fec_modif = data.provi_fec_modif;
    this.provi_fec_elimi = data.provi_fec_elimi ?? null;
  }

  public toJson(): ProvinciaEntity {
    return {
      ...(this.provi_cod_provi ? { provi_cod_provi: this.provi_cod_provi } : {}),
      provi_cod_prov: this.provi_cod_prov,
      provi_nom_provi: this.provi_nom_provi,
      provi_flg_acti: this.provi_flg_acti,
      ...(this.provi_fec_creac ? { provi_fec_creac: this.provi_fec_creac } : {}),
      ...(this.provi_fec_modif ? { provi_fec_modif: this.provi_fec_modif } : {}),
      provi_fec_elimi: this.provi_fec_elimi,
    };
  }
}

/**
 * Value object para Cantón
 */
export class CantonValue implements CantonEntity {
  canto_cod_canto?: number;
  provi_cod_provi: number;
  canto_cod_cant: string;
  canto_nom_canto: string;
  canto_flg_acti: boolean;
  canto_fec_creac?: Date;
  canto_fec_modif?: Date;
  canto_fec_elimi?: Date | null;

  constructor(data: CantonEntity, id?: number) {
    this.canto_cod_canto = id ?? data.canto_cod_canto;
    this.provi_cod_provi = data.provi_cod_provi;
    this.canto_cod_cant = data.canto_cod_cant.trim().padStart(2, '0'); // Preservar ceros a la izquierda
    this.canto_nom_canto = data.canto_nom_canto.trim();
    this.canto_flg_acti = data.canto_flg_acti ?? true;
    this.canto_fec_creac = data.canto_fec_creac;
    this.canto_fec_modif = data.canto_fec_modif;
    this.canto_fec_elimi = data.canto_fec_elimi ?? null;
  }

  public toJson(): CantonEntity {
    return {
      ...(this.canto_cod_canto ? { canto_cod_canto: this.canto_cod_canto } : {}),
      provi_cod_provi: this.provi_cod_provi,
      canto_cod_cant: this.canto_cod_cant,
      canto_nom_canto: this.canto_nom_canto,
      canto_flg_acti: this.canto_flg_acti,
      ...(this.canto_fec_creac ? { canto_fec_creac: this.canto_fec_creac } : {}),
      ...(this.canto_fec_modif ? { canto_fec_modif: this.canto_fec_modif } : {}),
      canto_fec_elimi: this.canto_fec_elimi,
    };
  }
}

/**
 * Value object para Parroquia
 */
export class ParroquiaValue implements ParroquiaEntity {
  parro_cod_parro?: number;
  canto_cod_canto: number;
  parro_cod_parr: string;
  parro_nom_parro: string;
  parro_tip_area?: 'R' | 'U' | null;
  parro_flg_acti: boolean;
  parro_fec_creac?: Date;
  parro_fec_modif?: Date;
  parro_fec_elimi?: Date | null;
  // Campos relacionados (opcionales, para mostrar información completa)
  canto_cod_cant?: string;
  canto_nom_canto?: string;
  provi_cod_prov?: string;
  provi_nom_provi?: string;

  constructor(data: ParroquiaEntity & { canto_cod_cant?: string; canto_nom_canto?: string; provi_cod_prov?: string; provi_nom_provi?: string }, id?: number) {
    this.parro_cod_parro = id ?? data.parro_cod_parro;
    this.canto_cod_canto = data.canto_cod_canto;
    this.parro_cod_parr = data.parro_cod_parr.trim().padStart(2, '0'); // Preservar ceros a la izquierda
    this.parro_nom_parro = data.parro_nom_parro.trim();
    this.parro_tip_area = data.parro_tip_area ? data.parro_tip_area.toUpperCase() as 'R' | 'U' : null;
    this.parro_flg_acti = data.parro_flg_acti ?? true;
    this.parro_fec_creac = data.parro_fec_creac;
    this.parro_fec_modif = data.parro_fec_modif;
    this.parro_fec_elimi = data.parro_fec_elimi ?? null;
    // Campos relacionados
    this.canto_cod_cant = data.canto_cod_cant;
    this.canto_nom_canto = data.canto_nom_canto;
    this.provi_cod_prov = data.provi_cod_prov;
    this.provi_nom_provi = data.provi_nom_provi;
  }

  public toJson(): ParroquiaEntity {
    return {
      ...(this.parro_cod_parro ? { parro_cod_parro: this.parro_cod_parro } : {}),
      canto_cod_canto: this.canto_cod_canto,
      parro_cod_parr: this.parro_cod_parr,
      parro_nom_parro: this.parro_nom_parro,
      parro_tip_area: this.parro_tip_area,
      parro_flg_acti: this.parro_flg_acti,
      ...(this.parro_fec_creac ? { parro_fec_creac: this.parro_fec_creac } : {}),
      ...(this.parro_fec_modif ? { parro_fec_modif: this.parro_fec_modif } : {}),
      parro_fec_elimi: this.parro_fec_elimi,
      // Incluir campos relacionados si están disponibles
      ...(this.canto_cod_cant ? { canto_cod_cant: this.canto_cod_cant } : {}),
      ...(this.canto_nom_canto ? { canto_nom_canto: this.canto_nom_canto } : {}),
      ...(this.provi_cod_prov ? { provi_cod_prov: this.provi_cod_prov } : {}),
      ...(this.provi_nom_provi ? { provi_nom_provi: this.provi_nom_provi } : {}),
    };
  }
}

