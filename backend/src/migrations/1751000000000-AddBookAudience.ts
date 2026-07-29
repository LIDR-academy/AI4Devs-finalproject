import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBookAudience1751000000000 implements MigrationInterface {
  name = 'AddBookAudience1751000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE books
      ADD COLUMN audience VARCHAR(32) NULL
      CHECK (
        audience IS NULL OR audience IN ('young_adult', 'new_adult', 'adult')
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE books DROP COLUMN IF EXISTS audience
    `);
  }
}
