import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Crea la tabla checklist_versions (historial de versiones del checklist WHO).
 * Requiere que la tabla checklists exista.
 */
export class CreateChecklistVersionsTable1738612720000 implements MigrationInterface {
  name = 'CreateChecklistVersionsTable1738612720000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "checklist_versions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "checklist_id" uuid NOT NULL,
        "version_number" integer NOT NULL,
        "phase_updated" varchar(20),
        "checklist_data_snapshot" jsonb NOT NULL DEFAULT '{}',
        "pre_induction_complete" boolean NOT NULL DEFAULT false,
        "pre_incision_complete" boolean NOT NULL DEFAULT false,
        "post_procedure_complete" boolean NOT NULL DEFAULT false,
        "completed_at_snapshot" TIMESTAMP,
        "created_by" uuid,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_checklist_versions" PRIMARY KEY ("id"),
        CONSTRAINT "FK_checklist_versions_checklist" FOREIGN KEY ("checklist_id")
          REFERENCES "checklists"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_checklist_versions_checklist_id" ON "checklist_versions" ("checklist_id")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_checklist_versions_created_at" ON "checklist_versions" ("created_at" DESC)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "checklist_versions"`);
  }
}
