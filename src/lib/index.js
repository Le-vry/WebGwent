// place files you want to import through the `$lib` alias in this folder.
import { getPrismaClient } from '$lib/server/prisma';

export const prisma = getPrismaClient();