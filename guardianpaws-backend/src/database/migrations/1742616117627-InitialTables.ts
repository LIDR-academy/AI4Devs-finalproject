import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialTables1742616117627 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Habilitar la extensión uuid-ossp si no está habilitada
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

        // Crear tipo enum para el estado
        await queryRunner.query(`
            CREATE TYPE estado_reporte AS ENUM ('abierto', 'cerrado')
        `);

        // Crear tabla mascotas
        await queryRunner.query(`
            CREATE TABLE "mascotas" (
                "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
                "nombre" VARCHAR(255) NOT NULL,
                "tipo" VARCHAR(50) NOT NULL,
                "raza" VARCHAR(100) NOT NULL,
                "color" VARCHAR(50) NOT NULL,
                "edad" INTEGER NOT NULL,
                "descripcion" TEXT,
                "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Crear tabla reporte_perdida
        await queryRunner.query(`
            CREATE TABLE "reporte_perdida" (
                "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
                "usuario_id" UUID NOT NULL,
                "mascota_id" UUID NOT NULL,
                "ubicacion" VARCHAR(255) NOT NULL,
                "fecha_reporte" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                "estado" estado_reporte NOT NULL DEFAULT 'abierto',
                "descripcion" TEXT,
                "encontrada" BOOLEAN DEFAULT false,
                "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "fk_mascota" FOREIGN KEY ("mascota_id") 
                    REFERENCES "mascotas" ("id") ON DELETE CASCADE
            )
        `);

        // Crear tabla historial_reporte
        await queryRunner.query(`
            CREATE TABLE "historial_reporte" (
                "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
                "reporte_id" UUID NOT NULL,
                "estado" estado_reporte NOT NULL DEFAULT 'abierto',
                "fecha_cambio" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                "comentario" TEXT,
                "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "fk_reporte" FOREIGN KEY ("reporte_id") 
                    REFERENCES "reporte_perdida" ("id") ON DELETE CASCADE
            )
        `);

        // Crear tabla imagenes
        await queryRunner.query(`
            CREATE TABLE "imagenes" (
                "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
                "reporte_id" UUID NOT NULL,
                "url" VARCHAR(255) NOT NULL,
                "key" VARCHAR(255) NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "fk_reporte_imagen" FOREIGN KEY ("reporte_id") 
                    REFERENCES "reporte_perdida" ("id") ON DELETE CASCADE
            )
        `);

        // Crear índices
        await queryRunner.query(`
            CREATE INDEX "idx_reporte_usuario" ON "reporte_perdida" ("usuario_id");
            CREATE INDEX "idx_reporte_mascota" ON "reporte_perdida" ("mascota_id");
            CREATE INDEX "idx_historial_reporte" ON "historial_reporte" ("reporte_id");
            CREATE INDEX "idx_imagenes_reporte" ON "imagenes" ("reporte_id");
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar índices
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_imagenes_reporte"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_historial_reporte"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_reporte_mascota"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_reporte_usuario"`);

        // Eliminar tablas
        await queryRunner.query(`DROP TABLE IF EXISTS "imagenes"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "historial_reporte"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "reporte_perdida"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "mascotas"`);
        
        // Eliminar tipo enum
        await queryRunner.query(`DROP TYPE IF EXISTS estado_reporte`);
    }
} 