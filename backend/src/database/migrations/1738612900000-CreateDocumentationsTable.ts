import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Idempotente: enum con DO/EXCEPTION y CREATE TABLE/INDEX IF NOT EXISTS
 * por si ya existen (p. ej. por synchronize).
 */
export class CreateDocumentationsTable1738612900000 implements MigrationInterface {
  name = 'CreateDocumentationsTable1738612900000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "documentations_status_enum" AS ENUM (
          'draft', 'in_progress', 'completed', 'archived'
        );
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "documentations" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "surgery_id" uuid NOT NULL,
        "preoperative_notes" text,
        "intraoperative_notes" text,
        "postoperative_notes" text,
        "procedure_details" jsonb,
        "status" "documentations_status_enum" NOT NULL DEFAULT 'draft',
        "created_by" uuid,
        "last_modified_by" uuid,
        "change_history" jsonb,
        "last_saved_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_documentations" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_documentations_surgery_id" UNIQUE ("surgery_id"),
        CONSTRAINT "FK_documentations_surgery" FOREIGN KEY ("surgery_id")
          REFERENCES "surgeries"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_documentations_surgery_id" ON "documentations" ("surgery_id")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_documentations_status" ON "documentations" ("status")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "documentations"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "documentations_status_enum"`);
  }
}
