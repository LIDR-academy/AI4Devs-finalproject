import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { IsUUID, IsString, IsOptional, IsInt, IsDate } from 'class-validator';
// import { Trip } from './Trip';

@Entity('activities')
export class Activity {
  @PrimaryGeneratedColumn('uuid')
  @IsUUID()
  @IsOptional()
  id!: string;

  @Column()
  @IsString()
  name!: string;

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  description!: string;

  @Column()
  @IsInt()
  sequence!: number;

  @Column()
  @IsDate()
  dateTime!: Date;

  // @ManyToOne(() => Trip, (trip) => trip.activities)
  // trip: Trip;
}