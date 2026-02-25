import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const del1 = await prisma.application.deleteMany({});
    const del2 = await prisma.resume.deleteMany({});
    console.log(`Deleted ${del1.count} applications and ${del2.count} resumes`);
    console.log('All dummy data cleared!');
    await prisma.$disconnect();
}

main().catch(console.error);
