import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { IsUUID, IsString, IsOptional, IsDate, IsInt, IsArray, ArrayNotEmpty, ArrayMinSize, Min } from 'class-validator';
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

    @Column({ type: 'date', nullable: true })
    @IsDate()
    @IsOptional()
    startDate!: Date;

    @Column({ type: 'date', nullable: true })
    @IsDate()
    @IsOptional()
    endDate!: Date;

    @Column({ nullable: true })
    @IsString()
    description!: string;

    @Column({ default: 0, nullable: true })
    @IsInt()
    activityCount!: number;

    @Column("simple-array", { nullable: true })
    @IsArray()
    @IsString({ each: true })
    accompaniment!: string[];

    @Column("simple-array", { nullable: true })
    @IsArray()
    @IsString({ each: true })
    activityType!: string[];

    @Column({ type: 'int', nullable: true })
    @IsInt()
    @Min(0)
    @IsOptional()
    budgetMax!: number;

    @OneToMany(() => Activity, activity => activity.trip, { cascade: true })
    activities!: Activity[];
}