import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    try {
        const storeMembers = await prisma.storeMember.findMany({
            include: {
                store: true,
                user: true,
            }
        });
        console.log('--- STORE MEMBERS ---');
        console.log(JSON.stringify(storeMembers, null, 2));

        const stores = await prisma.store.findMany();
        console.log('--- ALL STORES ---');
        console.log(JSON.stringify(stores, null, 2));
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
