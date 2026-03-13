import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClient | undefined;
	pgPool: Pool | undefined;
	prismaAdapter: PrismaPg | undefined;
};

export function getPrismaClient() {
	const databaseUrl = process.env.DATABASE_URL;

	if (!databaseUrl) {
		throw new Error('DATABASE_URL is not set. Prisma requires this on the server runtime.');
	}

	if (!globalForPrisma.pgPool) {
		globalForPrisma.pgPool = new Pool({ connectionString: databaseUrl });
	}

	if (!globalForPrisma.prismaAdapter) {
		globalForPrisma.prismaAdapter = new PrismaPg(globalForPrisma.pgPool);
	}

	if (!globalForPrisma.prisma) {
		globalForPrisma.prisma = new PrismaClient({
			adapter: globalForPrisma.prismaAdapter
		});
	}

	return globalForPrisma.prisma;
}
