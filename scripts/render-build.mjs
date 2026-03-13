import { existsSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

function run(command, args) {
	const result = spawnSync(command, args, { stdio: 'inherit', shell: process.platform === 'win32' });
	if (result.status !== 0) {
		process.exit(result.status ?? 1);
	}
}

const migrationsDir = 'prisma/migrations';
const hasMigrationsDir = existsSync(migrationsDir);
const hasMigrationEntries = hasMigrationsDir && readdirSync(migrationsDir).length > 0;
const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);
const migrateOnly = process.argv.includes('--migrate-only');

if (hasMigrationsDir && hasMigrationEntries) {
	if (!hasDatabaseUrl) {
		console.error('DATABASE_URL is required when prisma/migrations exists.');
		process.exit(1);
	}

	console.log('Applying Prisma migrations...');
	run('npx', ['prisma', 'migrate', 'deploy']);
} else {
	console.log('No Prisma migrations found, skipping migrate deploy.');
}

if (!migrateOnly) {
	console.log('Building app...');
	run('npx', ['vite', 'build']);
}
