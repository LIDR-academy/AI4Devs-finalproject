import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
});

beforeAll(async () => {
    // Ensure test database is clean before all tests
    await prisma.payment.deleteMany();
    await prisma.reservation.deleteMany();
    await prisma.court.deleteMany();
    await prisma.user.deleteMany();
});

afterEach(async () => {
    // Clear data between tests to ensure isolation
    await prisma.payment.deleteMany();
    await prisma.reservation.deleteMany();
});

afterAll(async () => {
    // Cleanup and disconnect
    await prisma.payment.deleteMany();
    await prisma.reservation.deleteMany();
    await prisma.court.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
});

export { prisma };
