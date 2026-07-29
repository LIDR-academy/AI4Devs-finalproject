import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBooksAndReadingRecords1735689600000
  implements MigrationInterface
{
  name = 'CreateBooksAndReadingRecords1735689600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(320) NOT NULL UNIQUE,
        password_hash VARCHAR(255),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS books (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        authors TEXT NOT NULL,
        isbn_13 VARCHAR(13),
        isbn_10 VARCHAR(10),
        cover_image_url TEXT,
        page_count INTEGER CHECK (page_count IS NULL OR page_count >= 0),
        genre VARCHAR(100),
        series_name VARCHAR(255),
        publication_year SMALLINT,
        data_source VARCHAR(32) NOT NULL CHECK (
          data_source IN ('open_library', 'google_books', 'goodreads', 'manual')
        ),
        external_provider_id VARCHAR(128),
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_books_user_id ON books(user_id)
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS reading_records (
        book_id UUID PRIMARY KEY REFERENCES books(id) ON DELETE CASCADE,
        status VARCHAR(20) NOT NULL CHECK (
          status IN ('pendiente', 'leyendo', 'leido', 'dnf')
        ),
        current_page INTEGER,
        progress_percent NUMERIC(5,2),
        rating SMALLINT CHECK (rating IS NULL OR (rating BETWEEN 1 AND 5)),
        read_format VARCHAR(20) CHECK (
          read_format IS NULL OR read_format IN ('fisico', 'ebook', 'audio')
        ),
        started_on DATE,
        finished_on DATE,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS reading_records`);
    await queryRunner.query(`DROP TABLE IF EXISTS books`);
    await queryRunner.query(`DROP TABLE IF EXISTS users`);
  }
}
