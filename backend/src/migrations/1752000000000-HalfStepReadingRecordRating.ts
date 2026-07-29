import { MigrationInterface, QueryRunner } from 'typeorm';

export class HalfStepReadingRecordRating1752000000000
  implements MigrationInterface
{
  name = 'HalfStepReadingRecordRating1752000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE reading_records
      DROP CONSTRAINT IF EXISTS reading_records_rating_check
    `);

    await queryRunner.query(`
      ALTER TABLE reading_records
      ALTER COLUMN rating TYPE NUMERIC(2,1)
      USING rating::numeric(2,1)
    `);

    await queryRunner.query(`
      ALTER TABLE reading_records
      ADD CONSTRAINT reading_records_rating_check
      CHECK (
        rating IS NULL OR (
          rating >= 0.5 AND rating <= 5 AND (rating * 2) = TRUNC(rating * 2)
        )
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE reading_records
      DROP CONSTRAINT IF EXISTS reading_records_rating_check
    `);

    await queryRunner.query(`
      ALTER TABLE reading_records
      ALTER COLUMN rating TYPE SMALLINT
      USING ROUND(rating)::smallint
    `);

    await queryRunner.query(`
      ALTER TABLE reading_records
      ADD CONSTRAINT reading_records_rating_check
      CHECK (rating IS NULL OR (rating BETWEEN 1 AND 5))
    `);
  }
}
