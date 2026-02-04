import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Crea tablas del módulo de recursos: equipment, staff_assignments.
 * Requiere: operating_rooms, surgeries (planning).
 * Idempotente: IF NOT EXISTS.
 */
export class CreateResourcesTables1738612750000 implements MigrationInterface {
  name = 'CreateResourcesTables1738612750000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "equipment" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying(100) NOT NULL,
        "code" character varying(50),
        "type" character varying(80),
        "operating_room_id" uuid,
        "is_available" boolean NOT NULL DEFAULT true,
        "description" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_equipment" PRIMARY KEY ("id"),
        CONSTRAINT "FK_equipment_operating_room" FOREIGN KEY ("operating_room_id")
          REFERENCES "operating_rooms"("id") ON DELETE SET NULL
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_equipment_operating_room_id" ON "equipment" ("operating_room_id")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_equipment_type" ON "equipment" ("type")
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "staff_assignments" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "surgery_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "role" character varying(50) NOT NULL,
        "assigned_at" TIMESTAMP NOT NULL DEFAULT now(),
        "notes" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_staff_assignments" PRIMARY KEY ("id"),
        CONSTRAINT "FK_staff_assignments_surgery" FOREIGN KEY ("surgery_id")
          REFERENCES "surgeries"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_staff_assignments_surgery_id" ON "staff_assignments" ("surgery_id")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_staff_assignments_user_id" ON "staff_assignments" ("user_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "staff_assignments"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "equipment"`);
  }
}
