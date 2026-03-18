import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { getPrismaClient } from '$lib/server/prisma';

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

	const payload = JSON.stringify([deck, leader, faction]);
	const userId = locals.user.id;

	const waitingGame = await prisma.game.findFirst({
		where: {
			status: 'waiting',
			user2Id: null,
			user1Id: { not: userId }
		},
		orderBy: { id: 'asc' },
		select: { id: true, gameCode: true, player2Id: true }
	});

	if (waitingGame) {
		await prisma.$transaction([
			prisma.player.update({
				where: { id: waitingGame.player2Id },
				data: { deck: payload }
			}),
			prisma.game.update({
				where: { id: waitingGame.id },
				data: {
					status: 'active',
					user2Id: userId
				}
			})
		]);

		return json({ gameCode: waitingGame.gameCode, status: 'active' });
	}

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
				currentTurn: 1
			},
			select: { gameCode: true }
		});
	});

	return json({ gameCode: created.gameCode, status: 'waiting' });
};
