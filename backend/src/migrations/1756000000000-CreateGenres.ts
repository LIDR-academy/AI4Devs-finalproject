import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateGenres1756000000000 implements MigrationInterface {
  name = 'CreateGenres1756000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS genres (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        is_default BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_genres_user_name_lower
      ON genres (user_id, lower(name))
    `);

    await queryRunner.query(`
      ALTER TABLE books
      ADD COLUMN IF NOT EXISTS genre_id UUID NULL
      REFERENCES genres(id) ON DELETE SET NULL
    `);

    await queryRunner.query(`
      INSERT INTO genres (user_id, name, is_default)
      SELECT u.id, names.name, true
      FROM users u
      CROSS JOIN (VALUES
        ('Fantasía'),
        ('Thriller'),
        ('Ciencia ficción'),
        ('Romance'),
        ('Histórica'),
        ('Ficción'),
        ('No ficción')
      ) AS names(name)
      WHERE NOT EXISTS (
        SELECT 1 FROM genres g
        WHERE g.user_id = u.id AND lower(g.name) = lower(names.name)
      )
    `);

    await queryRunner.query(`
      INSERT INTO genres (user_id, name, is_default)
      SELECT DISTINCT b.user_id, trim(b.genre), false
      FROM books b
      WHERE b.genre IS NOT NULL AND trim(b.genre) <> ''
      AND NOT EXISTS (
        SELECT 1 FROM genres g
        WHERE g.user_id = b.user_id AND lower(g.name) = lower(trim(b.genre))
      )
    `);

    await queryRunner.query(`
      UPDATE books b
      SET genre_id = g.id
      FROM genres g
      WHERE g.user_id = b.user_id
        AND b.genre IS NOT NULL
        AND trim(b.genre) <> ''
        AND lower(g.name) = lower(trim(b.genre))
    `);

    await queryRunner.query(`
      ALTER TABLE books DROP COLUMN IF EXISTS genre
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE books
      ADD COLUMN IF NOT EXISTS genre VARCHAR(100) NULL
    `);

    await queryRunner.query(`
      UPDATE books b
      SET genre = g.name
      FROM genres g
      WHERE g.id = b.genre_id
    `);

    await queryRunner.query(`
      ALTER TABLE books DROP COLUMN IF EXISTS genre_id
    `);

    await queryRunner.query(`DROP TABLE IF EXISTS genres`);
  }
}
