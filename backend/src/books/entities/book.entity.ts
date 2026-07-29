import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/user.entity';
import { Audience } from '../../audiences/entities/audience.entity';
import { Genre } from '../../genres/entities/genre.entity';
import { ReadingRecord } from './reading-record.entity';
import { CatalogEdition } from './catalog-edition.entity';
import { UserBookOverride } from './user-book-override.entity';

export type DataSourceType =
  | 'open_library'
  | 'google_books'
  | 'goodreads'
  | 'manual';

export type AudienceType = 'young_adult' | 'new_adult' | 'adult';

@Entity('books')
export class Book {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, (user) => user.books, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'catalog_edition_id', type: 'uuid' })
  catalogEditionId: string;

  @ManyToOne(() => CatalogEdition, (edition) => edition.libraryBooks, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'catalog_edition_id' })
  catalogEdition: CatalogEdition;

  @OneToOne(() => UserBookOverride, (override) => override.userBook)
  override: UserBookOverride | null;

  @Column({ name: 'genre_id', type: 'uuid', nullable: true })
  genreId: string | null;

  @ManyToOne(() => Genre, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'genre_id' })
  genreRef: Genre | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'varchar', length: 32, nullable: true })
  audience: AudienceType | null;

  @Column({ name: 'audience_id', type: 'uuid', nullable: true })
  audienceId: string | null;

  @ManyToOne(() => Audience, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'audience_id' })
  audienceRef: Audience | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => ReadingRecord, (reading) => reading.book)
  readingRecord: ReadingRecord;
}
