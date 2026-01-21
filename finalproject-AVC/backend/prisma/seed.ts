import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@scpadel.com' },
        update: {},
        create: {
            email: 'admin@scpadel.com',
            passwordHash: adminPassword,
            role: 'ADMIN',
            active: true,
        },
    });
    console.log('✅ Created admin user:', admin.email);

    // Create player user
    const playerPassword = await bcrypt.hash('player123', 10);
    const player = await prisma.user.upsert({
        where: { email: 'player@scpadel.com' },
        update: {},
        create: {
            email: 'player@scpadel.com',
            passwordHash: playerPassword,
            role: 'PLAYER',
            active: true,
        },
    });
    console.log('✅ Created player user:', player.email);

    // Create courts
    const court1 = await prisma.court.upsert({
        where: { id: '00000000-0000-0000-0000-000000000001' },
        update: {},
        create: {
            id: '00000000-0000-0000-0000-000000000001',
            name: 'Cancha 1',
            active: true,
        },
    });

    const court2 = await prisma.court.upsert({
        where: { id: '00000000-0000-0000-0000-000000000002' },
        update: {},
        create: {
            id: '00000000-0000-0000-0000-000000000002',
            name: 'Cancha 2',
            active: true,
        },
    });

    console.log('✅ Created courts:', court1.name, court2.name);

    console.log('🎉 Seed completed!');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
