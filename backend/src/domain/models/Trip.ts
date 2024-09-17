import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { IsUUID, IsString, IsOptional, IsDate, IsInt } from 'class-validator';
import { User } from './User';
import { Activity } from './Activity';

@Entity('trips')
export class Trip {
  @PrimaryGeneratedColumn('uuid')
  @IsUUID()
  @IsOptional()
  id!: string;

  @ManyToOne(() => User, user => user.trips, { nullable: false })
  user!: User;

  @Column()
  @IsString()
  destination!: string;

  @Column({ type: 'date' })
  @IsDate()
  startDate!: Date;

  @Column({ type: 'date' })
  @IsDate()
  endDate!: Date;

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  description!: string;

  @Column({ default: 0 })
  @IsInt()
  activityCount!: number;

  @OneToMany(() => Activity, activity => activity.trip, { cascade: true })
  activities!: Activity[];
}