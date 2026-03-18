import type { RequestEvent } from '@sveltejs/kit';
import { getPrismaClient } from '$lib/server/prisma';

export const load = async ({ locals }: RequestEvent) => {
	const user = locals.user ?? null;

	if (!user) {
		return {
			user,
			reconnectMatch: null
		};
	}

	const prisma = getPrismaClient();
	const reconnectMatch = await prisma.game.findFirst({
		where: {
			status: { in: ['waiting', 'active'] },
			OR: [{ user1Id: user.id }, { user2Id: user.id }]
		},
		orderBy: { id: 'desc' },
		select: {
			gameCode: true,
			status: true
		}
	});

	return {
		user,
		reconnectMatch
	};
};
