export interface AuthEntity {
  usuar_cod_usuar: number;
  usuar_cod_perso: number;
  usuar_cod_perfi: number;
  perso_nom_rzsoc: string;
  usuar_nom_usuar: string;
  usuar_psw_usuar: string;
  usuar_dir_corre: string;
  usuar_est_usuar: string;
}

export interface SignInInterface {
  username: string;
  password: string;
}
