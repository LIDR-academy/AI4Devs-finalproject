import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMonthlyTbrTables1749500000000 implements MigrationInterface {
  name = 'CreateMonthlyTbrTables1749500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS monthly_tbr_lists (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        year SMALLINT NOT NULL,
        month SMALLINT NOT NULL CHECK (month BETWEEN 1 AND 12),
        list_status VARCHAR(20) NOT NULL DEFAULT 'active',
        auto_created BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE (user_id, year, month)
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_monthly_tbr_lists_user_id
        ON monthly_tbr_lists(user_id)
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS tbr_entries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        monthly_tbr_id UUID NOT NULL REFERENCES monthly_tbr_lists(id) ON DELETE CASCADE,
        book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
        sort_order INTEGER NOT NULL,
        completed BOOLEAN NOT NULL DEFAULT false,
        completed_at VARCHAR(30),
        added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE (monthly_tbr_id, book_id)
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_tbr_entries_monthly_tbr_sort
        ON tbr_entries(monthly_tbr_id, sort_order)
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_tbr_entries_book_id
        ON tbr_entries(book_id)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS tbr_entries`);
    await queryRunner.query(`DROP TABLE IF EXISTS monthly_tbr_lists`);
  }
}
