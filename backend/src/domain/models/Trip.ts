import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { IsUUID, IsString, IsOptional, IsDate, IsInt, IsEnum, Min } from 'class-validator';
import { User } from './User';
import { Activity } from './Activity';

export enum Accompaniment {
    Solo = "Solo",
    Friends = "Friends",
    Family = "Family",
    Couple = "Couple"
}

export enum ActivityType {
    Nature = "Nature",
    Culture = "Culture",
    Nightlife = "Nightlife",
    Gastronomic = "Gastronomic"
}

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

    @Column({
        type: 'enum',
        enum: Accompaniment,
        nullable: false
    })
    @IsEnum(Accompaniment)
    accompaniment!: Accompaniment;

    @Column({
        type: 'enum',
        enum: ActivityType,
        nullable: false
    })
    @IsEnum(ActivityType)
    activityType!: ActivityType;

    @Column({ type: 'int', nullable: false })
    @IsInt()
    @Min(0)
    budgetMax!: number;

    @OneToMany(() => Activity, activity => activity.trip, { cascade: true })
    activities!: Activity[];
}