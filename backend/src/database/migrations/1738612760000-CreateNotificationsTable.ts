import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Crea tabla notifications (confirmaciones, alertas para usuarios).
 * Idempotente: IF NOT EXISTS.
 */
export class CreateNotificationsTable1738612760000 implements MigrationInterface {
  name = 'CreateNotificationsTable1738612760000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "notifications" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "type" character varying(50) NOT NULL,
        "title" character varying(200) NOT NULL,
        "message" text,
        "related_id" uuid,
        "related_type" character varying(80),
        "read_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_notifications" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_notifications_user_id" ON "notifications" ("user_id")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_notifications_read_at" ON "notifications" ("read_at")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "notifications"`);
  }
}
