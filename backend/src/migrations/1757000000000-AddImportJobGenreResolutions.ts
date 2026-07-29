import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddImportJobGenreResolutions1757000000000
  implements MigrationInterface
{
  name = 'AddImportJobGenreResolutions1757000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE import_jobs
      ADD COLUMN IF NOT EXISTS genre_resolutions json NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE import_jobs
      DROP COLUMN IF EXISTS genre_resolutions
    `);
  }
}
