import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAudiences1754000000000 implements MigrationInterface {
  name = 'CreateAudiences1754000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS audiences (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        is_default BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_audiences_user_name_lower
      ON audiences (user_id, lower(name))
    `);

    await queryRunner.query(`
      ALTER TABLE books
      ADD COLUMN IF NOT EXISTS audience_id UUID NULL
      REFERENCES audiences(id) ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE books DROP COLUMN IF EXISTS audience_id
    `);
    await queryRunner.query(`DROP TABLE IF EXISTS audiences`);
  }
}
