import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';

/**
 * Seed para insertar usuario administrador
 * Username: administrador
 * Password: 123
 */
export class SeedAdminUser1734892900000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Verificar si ya existe un perfil "Administrador"
    const perfilExists = await queryRunner.query(`
      SELECT perfi_cod_perfi FROM rrfperfi WHERE perfi_nom_perfi = 'Administrador' LIMIT 1;
    `);

    let perfilId: number;

    if (perfilExists.length === 0) {
      // Crear perfil Administrador
      const perfilResult = await queryRunner.query(`
        INSERT INTO rrfperfi (
          perfi_nom_perfi,
          perfi_des_perfi,
          perfi_min_acctk,
          perfi_dia_rfrtk,
          perfi_min_lngpw,
          perfi_max_lngpw,
          perfi_ctr_mayus,
          perfi_ctr_minus,
          perfi_ctr_numer,
          perfi_ctr_espec,
          perfi_dia_vigpw,
          perfi_num_hispw,
          perfi_num_maxin,
          perfi_min_bloqu,
          perfi_min_venta,
          perfi_ctr_unise,
          perfi_min_timeo,
          perfi_ctr_mfare,
          perfi_ctr_activ,
          perfi_ctr_defec,
          perfi_fec_creac,
          perfi_fec_modif
        ) VALUES (
          'Administrador',
          'Perfil de administrador del sistema con permisos completos',
          60,  -- 60 minutos para access token
          30,  -- 30 días para refresh token
          8,   -- Mínimo 8 caracteres
          128, -- Máximo 128 caracteres
          true, -- Requiere mayúscula
          true, -- Requiere minúscula
          true, -- Requiere número
          true, -- Requiere carácter especial
          365, -- 365 días de vigencia (1 año)
          10,  -- 10 contraseñas en historial
          10,  -- 10 intentos fallidos máximo
          60,  -- 60 minutos de bloqueo
          30,  -- Ventana de 30 minutos
          false, -- No requiere sesión única (puede tener múltiples sesiones)
          480, -- 8 horas de timeout (480 minutos)
          false, -- No requiere MFA por defecto
          true, -- Activo
          true, -- Es perfil por defecto
          NOW(),
          NOW()
        ) RETURNING perfi_cod_perfi;
      `);
      perfilId = perfilResult[0].perfi_cod_perfi;
    } else {
      perfilId = perfilExists[0].perfi_cod_perfi;
    }

    // 2. Verificar si ya existe el usuario administrador
    const usuarioExists = await queryRunner.query(`
      SELECT usuar_cod_usuar FROM rrfusuar WHERE usuar_nom_usuar = 'administrador' LIMIT 1;
    `);

    if (usuarioExists.length === 0) {
      // Hashear la contraseña "123"
      // Nota: En producción, esto debería ser más seguro, pero para desarrollo/testing está bien
      const passwordHash = await bcrypt.hash('123', 12);

      // Insertar usuario administrador
      // Nota: Se asume que existe empresa con ID 1 y oficina con ID 1
      // Si no existen, se deben crear primero en el módulo MS-CONFI
      await queryRunner.query(
        `
        INSERT INTO rrfusuar (
          usuar_uuid_usuar,
          usuar_nom_usuar,
          usuar_des_usuar,
          usuar_dir_email,
          usuar_pwd_usuar,
          usuar_cod_empre,
          usuar_cod_ofici,
          usuar_cod_perfi,
          usuar_cod_emple,
          usuar_tip_usuar,
          usuar_ctr_admin,
          usuar_ctr_globa,
          usuar_fec_ultpw,
          usuar_ctr_frzpw,
          usuar_ctr_nexpw,
          usuar_num_intfa,
          usuar_ctr_mfaac,
          usuar_ctr_activ,
          usuar_ctr_siste,
          usuar_fec_elimi
        ) VALUES (
          uuid_generate_v4(),
          'administrador',
          'Usuario Administrador',
          'admin@finantix.local',
          $1,
          1,  -- empresaId (debe existir en rrfempre)
          1,  -- oficinaId (debe existir en rrfofici)
          $2, -- perfilId
          NULL, -- empleadoId (opcional)
          'SISTEMA', -- Tipo SISTEMA para acceso 24/7
          true, -- Es administrador
          true, -- Acceso global
          NOW(),
          false, -- No forzar cambio de contraseña inicialmente
          true,  -- Contraseña nunca expira (para usuario sistema)
          0,     -- Sin intentos fallidos
          false, -- MFA no activado
          true,  -- Activo
          true,  -- Es usuario sistema (no eliminable)
          NULL   -- No eliminado
        );
      `,
        [passwordHash, perfilId]
      );

      console.log('✅ Usuario administrador creado exitosamente');
      console.log('   Username: administrador');
      console.log('   Password: 123');
      console.log('   ⚠️  IMPORTANTE: Cambiar la contraseña en producción');
    } else {
      console.log('ℹ️  Usuario administrador ya existe, omitiendo creación');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar usuario administrador
    await queryRunner.query(`
      DELETE FROM rrfusuar WHERE usuar_nom_usuar = 'administrador';
    `);

    // Opcional: Eliminar perfil Administrador si no tiene otros usuarios
    // (Comentado para evitar eliminar si hay otros usuarios)
    /*
    await queryRunner.query(`
      DELETE FROM rrfperfi 
      WHERE perfi_nom_perfi = 'Administrador' 
      AND NOT EXISTS (
        SELECT 1 FROM rrfusuar WHERE usuar_cod_perfi = perfi_cod_perfi
      );
    `);
    */
  }
}

