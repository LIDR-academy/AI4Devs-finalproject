import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Book } from '../../books/entities/book.entity';
import { MonthlyTbrList } from './monthly-tbr-list.entity';

@Entity('tbr_entries')
@Unique(['monthlyTbrId', 'bookId'])
export class TbrEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'monthly_tbr_id', type: 'uuid' })
  monthlyTbrId: string;

  @ManyToOne(() => MonthlyTbrList, (list) => list.entries, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'monthly_tbr_id' })
  monthlyTbr: MonthlyTbrList;

  @Column({ name: 'book_id', type: 'uuid' })
  bookId: string;

  @ManyToOne(() => Book, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'book_id' })
  book: Book;

  @Column({ name: 'sort_order', type: 'int' })
  sortOrder: number;

  @Column({ type: 'boolean', default: false })
  completed: boolean;

  @Column({ name: 'completed_at', type: 'varchar', length: 30, nullable: true })
  completedAt: string | null;

  @CreateDateColumn({ name: 'added_at' })
  addedAt: Date;
}
