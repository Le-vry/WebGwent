import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { getPrismaClient } from '$lib/server/prisma';
import { notifyOpenMatchUpdates } from '$lib/server/openMatchUpdates';

export const POST = async ({ locals }: RequestEvent) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const prisma = getPrismaClient();
	const userId = locals.user.id;

	const result = await prisma.game.updateMany({
		where: {
			status: { in: ['waiting', 'active'] },
			OR: [{ user1Id: userId }, { user2Id: userId }]
		},
		data: {
			status: 'cancelled'
		}
	});

	if (result.count > 0) {
		notifyOpenMatchUpdates();
	}

	return json({ ok: true, resetCount: result.count });
};
