import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Idempotente: usa IF NOT EXISTS por si las tablas ya existen (p. ej. por synchronize).
 */
export class CreateFollowupTables1738612800000 implements MigrationInterface {
  name = 'CreateFollowupTables1738612800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "postop_evolutions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "surgery_id" uuid NOT NULL,
        "evolution_date" date NOT NULL,
        "clinical_notes" text,
        "vital_signs" jsonb,
        "has_complications" boolean NOT NULL DEFAULT false,
        "complications_notes" text,
        "medications" jsonb,
        "recorded_by" uuid,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_postop_evolutions" PRIMARY KEY ("id"),
        CONSTRAINT "FK_postop_evolutions_surgery" FOREIGN KEY ("surgery_id")
          REFERENCES "surgeries"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_postop_evolutions_surgery_id" ON "postop_evolutions" ("surgery_id")
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "discharge_plans" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "surgery_id" uuid NOT NULL,
        "surgery_summary" text,
        "instructions" text,
        "custom_instructions" jsonb,
        "medications_at_discharge" jsonb,
        "follow_up_appointments" jsonb,
        "status" character varying(50) NOT NULL DEFAULT 'draft',
        "generated_by" uuid,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_discharge_plans" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_discharge_plans_surgery_id" UNIQUE ("surgery_id"),
        CONSTRAINT "FK_discharge_plans_surgery" FOREIGN KEY ("surgery_id")
          REFERENCES "surgeries"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_discharge_plans_surgery_id" ON "discharge_plans" ("surgery_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "discharge_plans"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "postop_evolutions"`);
  }
}
