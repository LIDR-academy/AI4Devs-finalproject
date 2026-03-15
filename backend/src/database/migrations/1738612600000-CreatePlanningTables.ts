import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Crea las tablas del módulo de planificación quirúrgica.
 * Requiere que la tabla patients exista (módulo HCE).
 * Orden: operating_rooms -> surgeries -> surgical_plannings -> dicom_images.
 */
export class CreatePlanningTables1738612600000 implements MigrationInterface {
  name = 'CreatePlanningTables1738612600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enums para surgeries (idempotente: ya pueden existir si se usó synchronize)
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "surgeries_type_enum" AS ENUM ('elective', 'urgent', 'emergency');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "surgeries_status_enum" AS ENUM ('planned', 'scheduled', 'in_progress', 'completed', 'cancelled');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$
    `);

    // operating_rooms
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "operating_rooms" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying(100) NOT NULL,
        "code" character varying(50),
        "description" text,
        "floor" character varying(50),
        "building" character varying(50),
        "is_active" boolean NOT NULL DEFAULT true,
        "equipment" jsonb,
        "capacity" integer,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_operating_rooms" PRIMARY KEY ("id")
      )
    `);

    // surgeries (FK a patients y operating_rooms)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "surgeries" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "patient_id" uuid NOT NULL,
        "surgeon_id" uuid NOT NULL,
        "procedure" character varying(200) NOT NULL,
        "type" "surgeries_type_enum" NOT NULL DEFAULT 'elective',
        "status" "surgeries_status_enum" NOT NULL DEFAULT 'planned',
        "scheduled_date" TIMESTAMP,
        "start_time" TIMESTAMP,
        "end_time" TIMESTAMP,
        "operating_room_id" uuid,
        "preop_notes" text,
        "postop_notes" text,
        "risk_scores" jsonb,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_surgeries" PRIMARY KEY ("id"),
        CONSTRAINT "FK_surgeries_patient" FOREIGN KEY ("patient_id")
          REFERENCES "patients"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_surgeries_operating_room" FOREIGN KEY ("operating_room_id")
          REFERENCES "operating_rooms"("id") ON DELETE SET NULL
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_surgeries_patient_id" ON "surgeries" ("patient_id")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_surgeries_surgeon_id" ON "surgeries" ("surgeon_id")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_surgeries_operating_room_id" ON "surgeries" ("operating_room_id")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_surgeries_status" ON "surgeries" ("status")
    `);

    // surgical_plannings (FK a surgeries)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "surgical_plannings" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "surgery_id" uuid NOT NULL,
        "analysis_data" jsonb,
        "approach_selected" character varying(100),
        "simulation_data" jsonb,
        "guide_3d_id" uuid,
        "planning_notes" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_surgical_plannings" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_surgical_plannings_surgery_id" UNIQUE ("surgery_id"),
        CONSTRAINT "FK_surgical_plannings_surgery" FOREIGN KEY ("surgery_id")
          REFERENCES "surgeries"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_surgical_plannings_surgery_id" ON "surgical_plannings" ("surgery_id")
    `);

    // dicom_images (FK a surgical_plannings)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "dicom_images" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "planning_id" uuid NOT NULL,
        "orthanc_instance_id" character varying(500) NOT NULL,
        "series_id" character varying(100),
        "study_id" character varying(100),
        "modality" character varying(50),
        "description" character varying(200),
        "metadata" jsonb,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_dicom_images" PRIMARY KEY ("id"),
        CONSTRAINT "FK_dicom_images_planning" FOREIGN KEY ("planning_id")
          REFERENCES "surgical_plannings"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_dicom_images_planning_id" ON "dicom_images" ("planning_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "dicom_images"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "surgical_plannings"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "surgeries"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "operating_rooms"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "surgeries_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "surgeries_type_enum"`);
  }
}
