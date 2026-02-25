import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';


declare global {
    var prisma: PrismaClient | undefined;
}

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

function createPrismaClient() {
    const url = process.env.DATABASE_URL || 'file:./dev.db';

    // The libsql adapter natively handles both 'file:' local URLs and 'libsql:' Turso URLs
    const adapter = new PrismaLibSql({
        url,
        authToken: process.env.TURSO_AUTH_TOKEN,
    });

    return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
