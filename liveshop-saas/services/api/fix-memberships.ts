import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    try {
        const userId = '2f459267-2d4e-44fa-b962-c0ec686ba1d8';

        // Check memberships
        const memberships = await prisma.storeMember.findMany({
            where: { userId }
        });
        console.log('--- MEMBERSHIPS FOR USER ---');
        console.log(memberships);

        // List all stores owned by this user
        const ownedStores = await prisma.store.findMany({
            where: { ownerId: userId }
        });
        console.log('--- OWNED STORES ---');
        console.log(ownedStores);

        // If memberships are missing, create them
        for (const store of ownedStores) {
            const exists = memberships.find(m => m.storeId === store.id);
            if (!exists) {
                console.log(`Creating missing membership for store: ${store.name}`);
                await prisma.storeMember.create({
                    data: {
                        storeId: store.id,
                        userId: userId,
                        role: 'owner',
                        permissions: ['products', 'orders', 'streams', 'settings']
                    }
                });
            }
        }

        console.log('Database sync complete.');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
