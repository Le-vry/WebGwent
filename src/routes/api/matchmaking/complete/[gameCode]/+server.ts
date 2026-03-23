import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { getPrismaClient } from '$lib/server/prisma';

export const POST = async ({ locals, params }: RequestEvent) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const gameCode = params.gameCode;
	if (!gameCode) {
		return json({ error: 'Missing game code' }, { status: 400 });
	}

	const prisma = getPrismaClient();
	const userId = locals.user.id;

	const game = await prisma.game.findUnique({
		where: { gameCode },
		select: {
			id: true,
			status: true,
			user1Id: true,
			user2Id: true
		}
	});

	if (!game) {
		return json({ error: 'Game not found' }, { status: 404 });
	}

	if (game.user1Id !== userId && game.user2Id !== userId) {
		return json({ error: 'Forbidden' }, { status: 403 });
	}

	if (game.status !== 'active') {
		return json({ ok: true, status: game.status });
	}

	await prisma.game.update({
		where: { id: game.id },
		data: { status: 'completed' }
	});

	return json({ ok: true, status: 'completed' });
};
