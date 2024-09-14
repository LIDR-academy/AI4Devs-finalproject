import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
// import { Trip } from "../trip/Trip";

@Entity()
export class User {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ unique: true })
    sessionId!: string;

    @Column({ type: "date" })
    creationDate!: Date;

    @Column({ type: "date", nullable: true })
    lastLogin!: Date;

    // @OneToMany(() => Trip, trip => trip.user)
    // trips: Trip[];
}