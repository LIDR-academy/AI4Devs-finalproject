import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Book } from './book.entity';

export const OVERRIDABLE_BOOK_FIELDS = [
  'title',
  'authors',
  'cover_image_url',
  'page_count',
  'series_name',
  'publication_year',
] as const;

export type OverridableBookField = (typeof OVERRIDABLE_BOOK_FIELDS)[number];

@Entity('user_book_overrides')
export class UserBookOverride {
  @PrimaryColumn({ name: 'user_book_id', type: 'uuid' })
  userBookId: string;

  @OneToOne(() => Book, (book) => book.override, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_book_id' })
  userBook: Book;

  @Column({
    name: 'overridden_fields',
    type: 'text',
    default: '[]',
    transformer: {
      to: (value: OverridableBookField[] | null | undefined) =>
        JSON.stringify(value ?? []),
      from: (value: string | string[] | null): OverridableBookField[] => {
        if (Array.isArray(value)) {
          return value as OverridableBookField[];
        }
        if (!value) {
          return [];
        }
        try {
          const parsed = JSON.parse(value) as unknown;
          return Array.isArray(parsed) ? (parsed as OverridableBookField[]) : [];
        } catch {
          return [];
        }
      },
    },
  })
  overriddenFields: OverridableBookField[];

  @Column({ type: 'text', nullable: true })
  title: string | null;

  @Column({ type: 'text', nullable: true })
  authors: string | null;

  @Column({ name: 'cover_image_url', type: 'text', nullable: true })
  coverImageUrl: string | null;

  @Column({ name: 'page_count', type: 'int', nullable: true })
  pageCount: number | null;

  @Column({ name: 'series_name', type: 'varchar', length: 255, nullable: true })
  seriesName: string | null;

  @Column({ name: 'publication_year', type: 'smallint', nullable: true })
  publicationYear: number | null;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
