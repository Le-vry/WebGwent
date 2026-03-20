import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { getPrismaClient } from '$lib/server/prisma';

export const POST = async ({ locals, params, request }: RequestEvent) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const body = await request.json().catch(() => null);
	const deck = body?.deck;
	const leader = body?.leader;
	const faction = body?.faction;

	if (!Array.isArray(deck) || !leader || !faction) {
		return json({ error: 'Invalid matchmaking payload' }, { status: 400 });
	}

	const prisma = getPrismaClient();
	const userId = locals.user.id;
	const gameCode = params.gameCode;

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

	const waitingGame = await prisma.game.findUnique({
		where: { gameCode },
		select: {
			id: true,
			gameCode: true,
			status: true,
			user1Id: true,
			user2Id: true,
			player2Id: true
		}
	});

	if (!waitingGame || waitingGame.status !== 'waiting' || waitingGame.user2Id) {
		return json({ error: 'This match is no longer joinable.' }, { status: 409 });
	}

	if (waitingGame.user1Id === userId) {
		return json({ error: 'You cannot join your own match.' }, { status: 409 });
	}

	const payload = JSON.stringify([deck, leader, faction]);
	const firstTurn = Math.random() < 0.5 ? 1 : 2;

	await prisma.$transaction([
		prisma.player.update({
			where: { id: waitingGame.player2Id },
			data: { deck: payload }
		}),
		prisma.game.update({
			where: { id: waitingGame.id },
			data: {
				status: 'active',
				user2Id: userId,
				currentTurn: firstTurn
			}
		})
	]);

	return json({ gameCode: waitingGame.gameCode, status: 'active', currentTurn: firstTurn });
};
