import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { getPrismaClient } from '$lib/server/prisma';
import { notifyOpenMatchUpdates } from '$lib/server/openMatchUpdates';

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function randomGameCode(length = 6) {
	let code = '';
	for (let i = 0; i < length; i += 1) {
		code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
	}
	return code;
}

async function createUniqueCode(prisma: ReturnType<typeof getPrismaClient>) {
	for (let i = 0; i < 10; i += 1) {
		const candidate = randomGameCode();
		const existing = await prisma.game.findUnique({ where: { gameCode: candidate }, select: { id: true } });
		if (!existing) return candidate;
	}
	return `${randomGameCode(4)}${Date.now().toString().slice(-4)}`;
}

export const POST = async ({ locals, request }: RequestEvent) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const prisma = getPrismaClient();
	const body = await request.json().catch(() => null);

	const deck = body?.deck;
	const leader = body?.leader;
	const faction = body?.faction;

	if (!Array.isArray(deck) || !leader || !faction) {
		return json({ error: 'Invalid matchmaking payload' }, { status: 400 });
	}

	const userId = locals.user.id;
	const existingLiveMatch = await prisma.game.findFirst({
		where: {
			status: { in: ['waiting', 'active'] },
			OR: [{ user1Id: userId }, { user2Id: userId }]
		},
		select: { gameCode: true, status: true }
	});

	if (existingLiveMatch) {
		return json(
			{ error: 'You already have a live match.', gameCode: existingLiveMatch.gameCode, status: existingLiveMatch.status },
			{ status: 409 }
		);
	}

	const payload = JSON.stringify([deck, leader, faction]);
	const gameCode = await createUniqueCode(prisma);

	const created = await prisma.$transaction(async (tx) => {
		const p1 = await tx.player.create({ data: { deck: payload } });
		const p2 = await tx.player.create({ data: { deck: '[]' } });
		const board = await tx.boardState.create({ data: {} });

		return tx.game.create({
			data: {
				gameCode,
				status: 'waiting',
				user1Id: userId,
				user2Id: null,
				player1Id: p1.id,
				player2Id: p2.id,
				boardStateId: board.id,
				currentTurn: 0
			},
			select: { gameCode: true }
		});
	});

	notifyOpenMatchUpdates();

	return json({ gameCode: created.gameCode, status: 'waiting' });
};
