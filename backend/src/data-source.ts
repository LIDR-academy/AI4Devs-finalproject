import { DataSource } from "typeorm";
import { User } from "./domain/models/User";
import { Activity } from "./domain/models/Activity";
import dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [User, Activity],
    synchronize: process.env.NODE_ENV !== 'production',
    logging: false,
});