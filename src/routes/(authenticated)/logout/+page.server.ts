import { redirect } from '@sveltejs/kit';
import type { Actions } from '@sveltejs/kit';
import { getPrismaClient } from '$lib/server/prisma';

export const actions: Actions = {
	default: async ({ cookies }) => {
		const prisma = getPrismaClient();
		const sessionToken = cookies.get('sessionToken');

		if (sessionToken) {
			await prisma.session.delete({ where: { token: sessionToken } }).catch(() => null);
		}

		cookies.delete('sessionToken', { path: '/' });
		throw redirect(303, '/');
	}
};
