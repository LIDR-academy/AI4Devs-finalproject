import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSharedCatalogEditions1759000000000 implements MigrationInterface {
  name = 'CreateSharedCatalogEditions1759000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS catalog_editions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        authors TEXT NOT NULL,
        isbn_13 VARCHAR(13) NULL,
        isbn_10 VARCHAR(10) NULL,
        cover_image_url TEXT NULL,
        page_count INTEGER NULL,
        series_name VARCHAR(255) NULL,
        publication_year SMALLINT NULL,
        catalog_genre VARCHAR(255) NULL,
        data_source VARCHAR(32) NOT NULL,
        external_provider_id VARCHAR(128) NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_catalog_editions_isbn13
      ON catalog_editions (isbn_13)
      WHERE isbn_13 IS NOT NULL
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_catalog_editions_provider
      ON catalog_editions (data_source, external_provider_id)
      WHERE external_provider_id IS NOT NULL
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS user_book_overrides (
        user_book_id UUID PRIMARY KEY REFERENCES books(id) ON DELETE CASCADE,
        overridden_fields TEXT NOT NULL DEFAULT '[]',
        title TEXT NULL,
        authors TEXT NULL,
        cover_image_url TEXT NULL,
        page_count INTEGER NULL,
        series_name VARCHAR(255) NULL,
        publication_year SMALLINT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      ALTER TABLE books
      ADD COLUMN IF NOT EXISTS catalog_edition_id UUID NULL
      REFERENCES catalog_editions(id) ON DELETE RESTRICT
    `);

    await queryRunner.query(`
      INSERT INTO catalog_editions (
        title, authors, isbn_13, isbn_10, cover_image_url, page_count,
        series_name, publication_year, catalog_genre, data_source, external_provider_id,
        created_at, updated_at
      )
      SELECT DISTINCT ON (b.isbn_13)
        b.title,
        b.authors,
        b.isbn_13,
        b.isbn_10,
        b.cover_image_url,
        b.page_count,
        b.series_name,
        b.publication_year,
        NULL,
        b.data_source,
        b.external_provider_id,
        b.created_at,
        b.updated_at
      FROM books b
      WHERE b.isbn_13 IS NOT NULL
      ORDER BY b.isbn_13, b.updated_at DESC
    `);

    await queryRunner.query(`
      UPDATE books b
      SET catalog_edition_id = ce.id
      FROM catalog_editions ce
      WHERE b.isbn_13 IS NOT NULL
        AND ce.isbn_13 = b.isbn_13
    `);

    await queryRunner.query(`
      INSERT INTO catalog_editions (
        title, authors, isbn_13, isbn_10, cover_image_url, page_count,
        series_name, publication_year, catalog_genre, data_source, external_provider_id,
        created_at, updated_at
      )
      SELECT DISTINCT ON (b.data_source, b.external_provider_id)
        b.title,
        b.authors,
        b.isbn_13,
        b.isbn_10,
        b.cover_image_url,
        b.page_count,
        b.series_name,
        b.publication_year,
        NULL,
        b.data_source,
        b.external_provider_id,
        b.created_at,
        b.updated_at
      FROM books b
      WHERE b.catalog_edition_id IS NULL
        AND b.external_provider_id IS NOT NULL
      ORDER BY b.data_source, b.external_provider_id, b.updated_at DESC
    `);

    await queryRunner.query(`
      UPDATE books b
      SET catalog_edition_id = ce.id
      FROM catalog_editions ce
      WHERE b.catalog_edition_id IS NULL
        AND b.external_provider_id IS NOT NULL
        AND ce.data_source = b.data_source
        AND ce.external_provider_id = b.external_provider_id
    `);

    await queryRunner.query(`
      CREATE TEMP TABLE book_catalog_map ON COMMIT DROP AS
      SELECT
        b.id AS book_id,
        gen_random_uuid() AS catalog_id,
        b.title,
        b.authors,
        b.isbn_13,
        b.isbn_10,
        b.cover_image_url,
        b.page_count,
        b.series_name,
        b.publication_year,
        b.data_source,
        b.external_provider_id,
        b.created_at,
        b.updated_at
      FROM books b
      WHERE b.catalog_edition_id IS NULL
    `);

    await queryRunner.query(`
      INSERT INTO catalog_editions (
        id, title, authors, isbn_13, isbn_10, cover_image_url, page_count,
        series_name, publication_year, catalog_genre, data_source, external_provider_id,
        created_at, updated_at
      )
      SELECT
        catalog_id, title, authors, isbn_13, isbn_10, cover_image_url, page_count,
        series_name, publication_year, NULL, data_source, external_provider_id,
        created_at, updated_at
      FROM book_catalog_map
    `);

    await queryRunner.query(`
      UPDATE books b
      SET catalog_edition_id = m.catalog_id
      FROM book_catalog_map m
      WHERE b.id = m.book_id
    `);

    await queryRunner.query(`
      INSERT INTO user_book_overrides (
        user_book_id,
        overridden_fields,
        title,
        authors,
        cover_image_url,
        page_count,
        series_name,
        publication_year
      )
      SELECT
        b.id,
        ARRAY_REMOVE(ARRAY[
          CASE WHEN b.title IS DISTINCT FROM ce.title THEN 'title' END,
          CASE WHEN b.authors IS DISTINCT FROM ce.authors THEN 'authors' END,
          CASE WHEN b.cover_image_url IS DISTINCT FROM ce.cover_image_url THEN 'cover_image_url' END,
          CASE WHEN b.page_count IS DISTINCT FROM ce.page_count THEN 'page_count' END,
          CASE WHEN b.series_name IS DISTINCT FROM ce.series_name THEN 'series_name' END,
          CASE WHEN b.publication_year IS DISTINCT FROM ce.publication_year THEN 'publication_year' END
        ], NULL),
        CASE WHEN b.title IS DISTINCT FROM ce.title THEN b.title END,
        CASE WHEN b.authors IS DISTINCT FROM ce.authors THEN b.authors END,
        CASE WHEN b.cover_image_url IS DISTINCT FROM ce.cover_image_url THEN b.cover_image_url END,
        CASE WHEN b.page_count IS DISTINCT FROM ce.page_count THEN b.page_count END,
        CASE WHEN b.series_name IS DISTINCT FROM ce.series_name THEN b.series_name END,
        CASE WHEN b.publication_year IS DISTINCT FROM ce.publication_year THEN b.publication_year END
      FROM books b
      INNER JOIN catalog_editions ce ON ce.id = b.catalog_edition_id
      WHERE
        b.title IS DISTINCT FROM ce.title
        OR b.authors IS DISTINCT FROM ce.authors
        OR b.cover_image_url IS DISTINCT FROM ce.cover_image_url
        OR b.page_count IS DISTINCT FROM ce.page_count
        OR b.series_name IS DISTINCT FROM ce.series_name
        OR b.publication_year IS DISTINCT FROM ce.publication_year
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_books_user_catalog
      ON books (user_id, catalog_edition_id)
      WHERE catalog_edition_id IS NOT NULL
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_books_catalog_edition_id
      ON books (catalog_edition_id)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_books_catalog_edition_id`);
    await queryRunner.query(`DROP INDEX IF EXISTS uq_books_user_catalog`);
    await queryRunner.query(`
      ALTER TABLE books DROP COLUMN IF EXISTS catalog_edition_id
    `);
    await queryRunner.query(`DROP TABLE IF EXISTS user_book_overrides`);
    await queryRunner.query(`DROP TABLE IF EXISTS catalog_editions`);
  }
}
