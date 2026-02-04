import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Crea la tabla documentation_versions (historial de versiones de documentación intraoperatoria).
 * Requiere que la tabla documentations exista.
 */
export class CreateDocumentationVersionsTable1738612910000 implements MigrationInterface {
  name = 'CreateDocumentationVersionsTable1738612910000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "documentation_versions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "documentation_id" uuid NOT NULL,
        "version_number" integer NOT NULL,
        "preoperative_notes" text,
        "intraoperative_notes" text,
        "postoperative_notes" text,
        "procedure_details" jsonb,
        "status_snapshot" varchar(20) NOT NULL DEFAULT 'draft',
        "created_by" uuid,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_documentation_versions" PRIMARY KEY ("id"),
        CONSTRAINT "FK_documentation_versions_documentation" FOREIGN KEY ("documentation_id")
          REFERENCES "documentations"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_documentation_versions_documentation_id" ON "documentation_versions" ("documentation_id")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_documentation_versions_created_at" ON "documentation_versions" ("created_at" DESC)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "documentation_versions"`);
  }
}
