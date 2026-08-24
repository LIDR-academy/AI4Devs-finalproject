import { PrismaClient } from '../../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

class PrismaSingleton {
  private static instance: PrismaClient;

  private constructor() { }

  public static getInstance(): PrismaClient {
    if (!PrismaSingleton.instance) {
      const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
      PrismaSingleton.instance = new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      });
    }
    return PrismaSingleton.instance;
  }
}

export const prisma = PrismaSingleton.getInstance();
