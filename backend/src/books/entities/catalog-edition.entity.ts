import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Book } from './book.entity';

export type CatalogDataSourceType =
  | 'open_library'
  | 'google_books'
  | 'goodreads'
  | 'manual';

@Entity('catalog_editions')
export class CatalogEdition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text' })
  authors: string;

  @Column({ name: 'isbn_13', type: 'varchar', length: 13, nullable: true })
  isbn13: string | null;

  @Column({ name: 'isbn_10', type: 'varchar', length: 10, nullable: true })
  isbn10: string | null;

  @Column({ name: 'cover_image_url', type: 'text', nullable: true })
  coverImageUrl: string | null;

  @Column({ name: 'page_count', type: 'int', nullable: true })
  pageCount: number | null;

  @Column({ name: 'series_name', type: 'varchar', length: 255, nullable: true })
  seriesName: string | null;

  @Column({ name: 'publication_year', type: 'smallint', nullable: true })
  publicationYear: number | null;

  @Column({ name: 'catalog_genre', type: 'varchar', length: 255, nullable: true })
  catalogGenre: string | null;

  @Column({ name: 'data_source', type: 'varchar', length: 32 })
  dataSource: CatalogDataSourceType;

  @Column({ name: 'external_provider_id', type: 'varchar', length: 128, nullable: true })
  externalProviderId: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Book, (book) => book.catalogEdition)
  libraryBooks: Book[];
}
