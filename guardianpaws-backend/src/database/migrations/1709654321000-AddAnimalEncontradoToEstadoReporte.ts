import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAnimalEncontradoToEstadoReporte1709654321000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TYPE estado_reporte ADD VALUE IF NOT EXISTS 'animal_encontrado';
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // No podemos eliminar valores de un enum en PostgreSQL
        // La única forma sería crear un nuevo tipo y cambiar la columna
        console.log('No se puede revertir la adición de un valor a un enum');
    }
} 