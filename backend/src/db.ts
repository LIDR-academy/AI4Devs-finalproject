import { Sequelize } from 'sequelize';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(process.env.DB_NAME!, process.env.DB_USER!, process.env.DB_PASSWORD!, {
  host: process.env.DB_HOST,
  dialect: 'postgres',
  logging: false,
});

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ikigoo';

async function connectToMongoDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

async function testPostgresConnection() {
  try {
    await sequelize.authenticate();
    console.log('Connection to PostgreSQL has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to PostgreSQL:', error);
  }
}

async function initializeDatabases() {
  await Promise.all([connectToMongoDB(), testPostgresConnection()]);
}

export { sequelize, mongoose, initializeDatabases };