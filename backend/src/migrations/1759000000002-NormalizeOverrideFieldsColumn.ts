import { MigrationInterface, QueryRunner } from 'typeorm';

export class NormalizeOverrideFieldsColumn1759000000002 implements MigrationInterface {
  name = 'NormalizeOverrideFieldsColumn1759000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE user_book_overrides
      ALTER COLUMN overridden_fields DROP DEFAULT
    `);

    await queryRunner.query(`
      ALTER TABLE user_book_overrides
      ALTER COLUMN overridden_fields TYPE TEXT
      USING array_to_json(overridden_fields)::text
    `);

    await queryRunner.query(`
      ALTER TABLE user_book_overrides
      ALTER COLUMN overridden_fields SET DEFAULT '[]'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE user_book_overrides
      ALTER COLUMN overridden_fields DROP DEFAULT
    `);

    await queryRunner.query(`
      ALTER TABLE user_book_overrides
      ALTER COLUMN overridden_fields TYPE TEXT[]
      USING ARRAY(SELECT json_array_elements_text(overridden_fields::json))
    `);

    await queryRunner.query(`
      ALTER TABLE user_book_overrides
      ALTER COLUMN overridden_fields SET DEFAULT '{}'
    `);
  }
}
