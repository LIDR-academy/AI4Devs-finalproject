import { DataSource } from "typeorm";
import { User } from "./domain/models/User";
import { Activity } from "./domain/models/Activity";
import { Trip } from "./domain/models/Trip";
import dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    entities: [User, Activity, Trip],
    synchronize: process.env.NODE_ENV !== 'production',
    logging: false,
});