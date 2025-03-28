import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEmailAndPhoneToHistorial1742616117628 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE historial_reporte
            ADD COLUMN email VARCHAR(255) DEFAULT 'sin_email@ejemplo.com',
            ADD COLUMN telefono VARCHAR(20) DEFAULT '000000000'
        `);

        // Ahora que las columnas tienen valores por defecto, podemos hacerlas NOT NULL
        await queryRunner.query(`
            ALTER TABLE historial_reporte
            ALTER COLUMN email SET NOT NULL,
            ALTER COLUMN telefono SET NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE historial_reporte
            DROP COLUMN email,
            DROP COLUMN telefono
        `);
    }
} 