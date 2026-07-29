import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAnnualReadingGoals1750000000000 implements MigrationInterface {
  name = 'CreateAnnualReadingGoals1750000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS annual_reading_goals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        year SMALLINT NOT NULL,
        target_book_count INTEGER NOT NULL CHECK (target_book_count > 0),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE (user_id, year)
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS annual_reading_goals`);
  }
}
