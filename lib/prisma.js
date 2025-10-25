import { PrismaClient } from '@prisma/client';

// Prevent multiple Prisma Client instances in dev
const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
