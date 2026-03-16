import { PersoEntity } from "../../../domain/entity/perso.entity";
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO de respuesta de Persona
 * Implementa la interfaz PersoEntity directamente
 */
export class PersoResponseDto implements PersoEntity {
  @ApiProperty({ example: 1, description: 'ID único de la persona' })
  perso_cod_perso?: number;

  @ApiProperty({ example: 1, description: 'Tipo de persona: 1=Natural, 2=Jurídica' })
  perso_cod_tpers: number;

  @ApiProperty({ example: 1, description: 'Tipo de identificación: 1=Cédula, 2=RUC, 3=Pasaporte' })
  perso_cod_tiden: number;

  @ApiProperty({ example: '1234567890', description: 'Cédula/RUC/Pasaporte' })
  perso_ide_perso: string;

  @ApiProperty({ example: 'PÉREZ GARCÍA JUAN CARLOS', description: 'Nombre completo o Razón Social' })
  perso_nom_perso: string;

  @ApiProperty({ example: '1990-01-15', description: 'Fecha de nacimiento o constitución' })
  perso_fec_inici: Date;

  @ApiProperty({ example: 1, description: 'Sexo: 1=Masculino, 2=Femenino, 3=No aplica' })
  perso_cod_sexos: number;

  @ApiProperty({ example: 1, description: 'Código de nacionalidad' })
  perso_cod_nacio: number;

  @ApiProperty({ example: 4, description: 'Nivel de instrucción' })
  perso_cod_instr: number;

  @ApiProperty({ example: 2, description: 'Estado civil (NULL para jurídica)', required: false, nullable: true })
  perso_cod_ecivi?: number | null;

  @ApiProperty({ example: 1, description: 'Etnia SEPS', required: false, nullable: true })
  perso_cod_etnia?: number | null;

  @ApiProperty({ example: '0991234567', description: 'Teléfono celular', required: false })
  perso_tlf_celul?: string;

  @ApiProperty({ example: '022345678', description: 'Teléfono convencional', required: false })
  perso_tlf_conve?: string;

  @ApiProperty({ example: 'juan.perez@example.com', description: 'Correo electrónico', required: false })
  perso_dir_email?: string;

  @ApiProperty({ example: 'ABC123', description: 'DAC del Registro Civil', required: false })
  perso_dac_regci?: string;

  @ApiProperty({ example: '2024-01-15T10:30:00Z', description: 'Fecha última consulta RC', required: false, nullable: true })
  perso_fec_ultrc?: Date | null;

  @ApiProperty({ example: 10000, description: 'Capital social (solo jurídica)', required: false })
  perso_cap_socia?: number;

  @ApiProperty({ example: '/storage/fotos/abc123.webp', description: 'Ruta de la foto', required: false })
  perso_fot_perso?: string;

  @ApiProperty({ example: '/storage/firmas/xyz789.webp', description: 'Ruta de la firma', required: false })
  perso_fir_perso?: string;

  @ApiProperty({ example: '2024-01-15T10:30:00Z', description: 'Fecha actualización foto', required: false, nullable: true })
  perso_fec_ultfo?: Date | null;

  @ApiProperty({ example: '2024-01-15T10:30:00Z', description: 'Fecha actualización firma', required: false, nullable: true })
  perso_fec_ultfi?: Date | null;

  @ApiProperty({ example: '2024-01-15T10:30:00Z', description: 'Fecha de creación' })
  created_at?: Date;

  @ApiProperty({ example: '2024-01-15T10:30:00Z', description: 'Fecha de modificación' })
  updated_at?: Date;

  @ApiProperty({ example: 1, description: 'ID del usuario que creó el registro' })
  created_by: number;

  @ApiProperty({ example: 1, description: 'ID del usuario que modificó el registro' })
  updated_by: number;

  @ApiProperty({ example: null, description: 'Fecha de eliminación (soft delete)', required: false, nullable: true })
  deleted_at?: Date | null;
}

