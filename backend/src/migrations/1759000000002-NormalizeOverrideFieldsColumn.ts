import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Converts overridden_fields from TEXT[] to JSON TEXT when needed.
 * Fresh installs already create the column as TEXT in migration 0000,
 * so this migration is a no-op when the column is already text.
 */
export class NormalizeOverrideFieldsColumn1759000000002 implements MigrationInterface {
  name = 'NormalizeOverrideFieldsColumn1759000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const columns = (await queryRunner.query(`
      SELECT data_type, udt_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'user_book_overrides'
        AND column_name = 'overridden_fields'
    `)) as Array<{ data_type: string; udt_name: string }>;

    if (columns.length === 0) {
      return;
    }

    const { data_type: dataType, udt_name: udtName } = columns[0];
    const isTextArray = dataType === 'ARRAY' || udtName === '_text';

    if (isTextArray) {
      await queryRunner.query(`
        ALTER TABLE user_book_overrides
        ALTER COLUMN overridden_fields DROP DEFAULT
      `);

      await queryRunner.query(`
        ALTER TABLE user_book_overrides
        ALTER COLUMN overridden_fields TYPE TEXT
        USING array_to_json(overridden_fields)::text
      `);
    }

    await queryRunner.query(`
      ALTER TABLE user_book_overrides
      ALTER COLUMN overridden_fields SET DEFAULT '[]'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const columns = (await queryRunner.query(`
      SELECT data_type, udt_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'user_book_overrides'
        AND column_name = 'overridden_fields'
    `)) as Array<{ data_type: string; udt_name: string }>;

    if (columns.length === 0) {
      return;
    }

    const { data_type: dataType, udt_name: udtName } = columns[0];
    const isTextArray = dataType === 'ARRAY' || udtName === '_text';
    if (isTextArray) {
      return;
    }

    await queryRunner.query(`
      ALTER TABLE user_book_overrides
      ALTER COLUMN overridden_fields DROP DEFAULT
    `);

    await queryRunner.query(`
      ALTER TABLE user_book_overrides
      ALTER COLUMN overridden_fields TYPE TEXT[]
      USING CASE
        WHEN overridden_fields IS NULL OR overridden_fields = '' THEN '{}'::text[]
        ELSE ARRAY(SELECT json_array_elements_text(overridden_fields::json))
      END
    `);

    await queryRunner.query(`
      ALTER TABLE user_book_overrides
      ALTER COLUMN overridden_fields SET DEFAULT '{}'
    `);
  }
}
