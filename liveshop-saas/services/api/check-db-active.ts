import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    try {
        const activeUsers = await prisma.user.findMany({
            orderBy: { lastLoginAt: 'desc' },
            take: 5,
            select: {
                id: true,
                email: true,
                lastLoginAt: true,
                role: true,
            }
        });
        console.log('--- MOST RECENTLY ACTIVE USERS ---');
        console.log(JSON.stringify(activeUsers, null, 2));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
