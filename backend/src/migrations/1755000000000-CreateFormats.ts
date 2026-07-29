import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFormats1755000000000 implements MigrationInterface {
  name = 'CreateFormats1755000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS formats (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        is_default BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_formats_user_name_lower
      ON formats (user_id, lower(name))
    `);

    await queryRunner.query(`
      ALTER TABLE reading_records
      ADD COLUMN IF NOT EXISTS format_id UUID NULL
      REFERENCES formats(id) ON DELETE SET NULL
    `);

    await queryRunner.query(`
      INSERT INTO formats (user_id, name, is_default)
      SELECT u.id, names.name, true
      FROM users u
      CROSS JOIN (VALUES ('Audio'), ('Ebook'), ('Físico')) AS names(name)
      WHERE NOT EXISTS (
        SELECT 1 FROM formats f
        WHERE f.user_id = u.id AND lower(f.name) = lower(names.name)
      )
    `);

    await queryRunner.query(`
      UPDATE reading_records rr
      SET format_id = f.id
      FROM books b
      JOIN formats f ON f.user_id = b.user_id AND lower(f.name) = 'físico'
      WHERE b.id = rr.book_id AND rr.read_format = 'fisico'
    `);

    await queryRunner.query(`
      UPDATE reading_records rr
      SET format_id = f.id
      FROM books b
      JOIN formats f ON f.user_id = b.user_id AND lower(f.name) = 'ebook'
      WHERE b.id = rr.book_id AND rr.read_format = 'ebook'
    `);

    await queryRunner.query(`
      UPDATE reading_records rr
      SET format_id = f.id
      FROM books b
      JOIN formats f ON f.user_id = b.user_id AND lower(f.name) = 'audio'
      WHERE b.id = rr.book_id AND rr.read_format = 'audio'
    `);

    await queryRunner.query(`
      ALTER TABLE reading_records DROP CONSTRAINT IF EXISTS reading_records_read_format_check
    `);

    await queryRunner.query(`
      ALTER TABLE reading_records DROP COLUMN IF EXISTS read_format
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE reading_records
      ADD COLUMN IF NOT EXISTS read_format VARCHAR(20) CHECK (
        read_format IS NULL OR read_format IN ('fisico', 'ebook', 'audio')
      )
    `);

    await queryRunner.query(`
      UPDATE reading_records rr
      SET read_format = CASE lower(f.name)
        WHEN 'físico' THEN 'fisico'
        WHEN 'ebook' THEN 'ebook'
        WHEN 'audio' THEN 'audio'
        ELSE NULL
      END
      FROM formats f
      WHERE f.id = rr.format_id
    `);

    await queryRunner.query(`
      ALTER TABLE reading_records DROP COLUMN IF EXISTS format_id
    `);

    await queryRunner.query(`DROP TABLE IF EXISTS formats`);
  }
}
