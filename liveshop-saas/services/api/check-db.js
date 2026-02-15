const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const stores = await prisma.store.findMany({
        include: {
            owner: true,
        }
    });
    console.log('Stores:', JSON.stringify(stores, null, 2));

    const users = await prisma.user.findMany();
    console.log('Users:', JSON.stringify(users, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
