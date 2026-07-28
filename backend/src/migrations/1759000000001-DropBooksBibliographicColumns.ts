import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropBooksBibliographicColumns1759000000001 implements MigrationInterface {
  name = 'DropBooksBibliographicColumns1759000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE books
      ALTER COLUMN catalog_edition_id SET NOT NULL
    `);

    await queryRunner.query(`ALTER TABLE books DROP COLUMN IF EXISTS title`);
    await queryRunner.query(`ALTER TABLE books DROP COLUMN IF EXISTS authors`);
    await queryRunner.query(`ALTER TABLE books DROP COLUMN IF EXISTS isbn_13`);
    await queryRunner.query(`ALTER TABLE books DROP COLUMN IF EXISTS isbn_10`);
    await queryRunner.query(`ALTER TABLE books DROP COLUMN IF EXISTS cover_image_url`);
    await queryRunner.query(`ALTER TABLE books DROP COLUMN IF EXISTS page_count`);
    await queryRunner.query(`ALTER TABLE books DROP COLUMN IF EXISTS series_name`);
    await queryRunner.query(`ALTER TABLE books DROP COLUMN IF EXISTS publication_year`);
    await queryRunner.query(`ALTER TABLE books DROP COLUMN IF EXISTS data_source`);
    await queryRunner.query(`ALTER TABLE books DROP COLUMN IF EXISTS external_provider_id`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE books
      ADD COLUMN IF NOT EXISTS title TEXT NULL,
      ADD COLUMN IF NOT EXISTS authors TEXT NULL,
      ADD COLUMN IF NOT EXISTS isbn_13 VARCHAR(13) NULL,
      ADD COLUMN IF NOT EXISTS isbn_10 VARCHAR(10) NULL,
      ADD COLUMN IF NOT EXISTS cover_image_url TEXT NULL,
      ADD COLUMN IF NOT EXISTS page_count INTEGER NULL,
      ADD COLUMN IF NOT EXISTS series_name VARCHAR(255) NULL,
      ADD COLUMN IF NOT EXISTS publication_year SMALLINT NULL,
      ADD COLUMN IF NOT EXISTS data_source VARCHAR(32) NULL,
      ADD COLUMN IF NOT EXISTS external_provider_id VARCHAR(128) NULL
    `);

    await queryRunner.query(`
      UPDATE books b
      SET
        title = CASE WHEN 'title' = ANY(o.overridden_fields) THEN o.title ELSE ce.title END,
        authors = CASE WHEN 'authors' = ANY(o.overridden_fields) THEN o.authors ELSE ce.authors END,
        isbn_13 = ce.isbn_13,
        isbn_10 = ce.isbn_10,
        cover_image_url = CASE WHEN 'cover_image_url' = ANY(o.overridden_fields) THEN o.cover_image_url ELSE ce.cover_image_url END,
        page_count = CASE WHEN 'page_count' = ANY(o.overridden_fields) THEN o.page_count ELSE ce.page_count END,
        series_name = CASE WHEN 'series_name' = ANY(o.overridden_fields) THEN o.series_name ELSE ce.series_name END,
        publication_year = CASE WHEN 'publication_year' = ANY(o.overridden_fields) THEN o.publication_year ELSE ce.publication_year END,
        data_source = ce.data_source,
        external_provider_id = ce.external_provider_id
      FROM catalog_editions ce
      LEFT JOIN user_book_overrides o ON o.user_book_id = b.id
      WHERE ce.id = b.catalog_edition_id
    `);

    await queryRunner.query(`
      ALTER TABLE books
      ALTER COLUMN catalog_edition_id DROP NOT NULL
    `);
  }
}
