import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Crea las tablas del módulo HCE (Historia Clínica Electrónica).
 * Orden: patients -> medical_records, allergies, medications -> lab_results, images.
 * Idempotente: usa IF NOT EXISTS / DO EXCEPTION por si ya existen (p. ej. por synchronize).
 */
export class CreateHCETables1738612500000 implements MigrationInterface {
  name = 'CreateHCETables1738612500000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enums
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "patients_gender_enum" AS ENUM ('M', 'F', 'Other');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "allergies_severity_enum" AS ENUM ('Low', 'Medium', 'High', 'Critical');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$
    `);

    // patients
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "patients" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "first_name" character varying(100) NOT NULL,
        "last_name" character varying(100) NOT NULL,
        "date_of_birth" date NOT NULL,
        "gender" "patients_gender_enum" NOT NULL,
        "ssn_encrypted" bytea,
        "phone" character varying(20),
        "email" character varying(255),
        "address" text,
        "created_by" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_patients" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_patients_created_by" ON "patients" ("created_by")
    `);

    // medical_records (FK patients)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "medical_records" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "patient_id" uuid NOT NULL,
        "medical_history" text,
        "family_history" text,
        "current_condition" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_medical_records" PRIMARY KEY ("id"),
        CONSTRAINT "FK_medical_records_patient" FOREIGN KEY ("patient_id")
          REFERENCES "patients"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_medical_records_patient_id" ON "medical_records" ("patient_id")
    `);

    // allergies (FK patients)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "allergies" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "patient_id" uuid NOT NULL,
        "allergen" character varying(100) NOT NULL,
        "severity" "allergies_severity_enum" NOT NULL,
        "notes" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_allergies" PRIMARY KEY ("id"),
        CONSTRAINT "FK_allergies_patient" FOREIGN KEY ("patient_id")
          REFERENCES "patients"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_allergies_patient_id" ON "allergies" ("patient_id")
    `);

    // medications (FK patients)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "medications" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "patient_id" uuid NOT NULL,
        "name" character varying(100) NOT NULL,
        "dosage" character varying(50) NOT NULL,
        "frequency" character varying(50) NOT NULL,
        "start_date" date NOT NULL,
        "end_date" date,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_medications" PRIMARY KEY ("id"),
        CONSTRAINT "FK_medications_patient" FOREIGN KEY ("patient_id")
          REFERENCES "patients"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_medications_patient_id" ON "medications" ("patient_id")
    `);

    // lab_results (FK medical_records)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "lab_results" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "medical_record_id" uuid NOT NULL,
        "test_name" character varying(100) NOT NULL,
        "results" jsonb NOT NULL,
        "test_date" date NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_lab_results" PRIMARY KEY ("id"),
        CONSTRAINT "FK_lab_results_medical_record" FOREIGN KEY ("medical_record_id")
          REFERENCES "medical_records"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_lab_results_medical_record_id" ON "lab_results" ("medical_record_id")
    `);

    // images (FK medical_records)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "images" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "medical_record_id" uuid NOT NULL,
        "file_path" character varying(500) NOT NULL,
        "image_type" character varying(50) NOT NULL,
        "uploaded_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_images" PRIMARY KEY ("id"),
        CONSTRAINT "FK_images_medical_record" FOREIGN KEY ("medical_record_id")
          REFERENCES "medical_records"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_images_medical_record_id" ON "images" ("medical_record_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "images"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "lab_results"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "medications"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "allergies"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "medical_records"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "patients"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "allergies_severity_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "patients_gender_enum"`);
  }
}
