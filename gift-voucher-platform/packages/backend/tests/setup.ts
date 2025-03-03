import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { config } from 'dotenv';

// Load environment variables
config();

let mongoServer: MongoMemoryServer;

// Connect to the in-memory database before all tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Check if mongoose is already connected
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoUri);
    console.log(`MongoDB successfully connected to ${mongoUri}`);
  } else {
    console.log('MongoDB already connected, reusing existing connection');
  }
});

// Clear all collections after each test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// Disconnect and close the in-memory database after all tests
afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
  console.log('MongoDB connection closed');
}); 