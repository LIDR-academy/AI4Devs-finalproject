import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { IsUUID, IsDate, IsString, IsOptional } from "class-validator";
import { Trip } from "./Trip";

@Entity()
export class User {
    @PrimaryGeneratedColumn("uuid")
    @IsUUID()
    @IsOptional()
    id!: string;

    @Column({ unique: true })
    @IsString()
    sessionId!: string;

    @Column({ type: "date" })
    @IsDate()
    creationDate!: Date;

    @Column({ type: "date", nullable: true })
    @IsDate()
    @IsOptional()
    lastLogin!: Date;

    @OneToMany(() => Trip, trip => trip.user, { cascade: true })
    trips!: Trip[];
}