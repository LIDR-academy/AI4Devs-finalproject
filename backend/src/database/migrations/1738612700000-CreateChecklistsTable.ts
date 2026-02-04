import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Crea la tabla checklists (checklist quirúrgico WHO).
 * Requiere que la tabla surgeries exista (creada por synchronize u otra migración).
 * Idempotente: usa IF NOT EXISTS por si la tabla ya existe (p. ej. por synchronize).
 */
export class CreateChecklistsTable1738612700000 implements MigrationInterface {
  name = 'CreateChecklistsTable1738612700000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "checklists" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "surgery_id" uuid NOT NULL,
        "pre_induction_complete" boolean NOT NULL DEFAULT false,
        "pre_incision_complete" boolean NOT NULL DEFAULT false,
        "post_procedure_complete" boolean NOT NULL DEFAULT false,
        "checklist_data" jsonb NOT NULL DEFAULT '{}',
        "completed_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_checklists" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_checklists_surgery_id" UNIQUE ("surgery_id"),
        CONSTRAINT "FK_checklists_surgery" FOREIGN KEY ("surgery_id")
          REFERENCES "surgeries"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_checklists_surgery_id" ON "checklists" ("surgery_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "checklists"`);
  }
}
