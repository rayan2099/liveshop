import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    try {
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
        const recentStores = await prisma.store.findMany({
            where: {
                createdAt: { gte: tenMinutesAgo }
            },
            include: {
                owner: true,
            }
        });
        console.log('--- RECENT STORES (Last 10m) ---');
        console.log(JSON.stringify(recentStores, null, 2));

        const recentUsers = await prisma.user.findMany({
            where: {
                createdAt: { gte: tenMinutesAgo }
            }
        });
        console.log('--- RECENT USERS (Last 10m) ---');
        console.log(JSON.stringify(recentUsers, null, 2));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
