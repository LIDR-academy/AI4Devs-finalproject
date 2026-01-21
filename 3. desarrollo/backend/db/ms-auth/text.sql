INSERT INTO public.rrfperso(
	perso_cod_perso, perso_ide_perso, perso_nom_rzsoc, perso_dac_perso, perso_ide_votac, perso_fec_nacim, perso_cod_tpers, perso_cod_sexos, perso_cod_ecivi, perso_cod_instr)
	VALUES (1, 'xxxxxxxx', 'XXXXX XXXXX XXXXX', 'XXXX4XXXXX', 'XXXXXXX', '1984-09-25', 1, 2, 4, 5)


INSERT INTO public.rrfusuar(
	usuar_cod_usuar, usuar_cod_perso, usuar_cod_perfi, usuar_nom_usuar, usuar_psw_usuar, usuar_dir_corre, usuar_est_usuar)
	VALUES (1, 1, 1, 'XXXXXXXX', 'xxxx', 'XXXXX@xxxxx.xxx.xxx', 'A');


SELECT 
	per.perso_nom_rzsoc,
	usu.usuar_cod_usuar,    
	usu.usuar_cod_perso,
	usu.usuar_cod_perfi,    
	usu.usuar_nom_usuar,
    usu.usuar_psw_usuar,
	usu.usuar_dir_corre,
    usu.usuar_est_usuar
FROM rrfusuar AS usu
INNER JOIN rrfperso AS per ON usu.usuar_cod_perso = per.perso_cod_perso
