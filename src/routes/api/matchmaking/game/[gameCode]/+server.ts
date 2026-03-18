import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { getPrismaClient } from '$lib/server/prisma';

const DEFAULT_PLAYER_PAYLOAD = [[], { name: 'Ballista1' }, { name: 'Northern Realms', ability: '' }];

function parseDeckPayload(raw: string) {
	try {
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : DEFAULT_PLAYER_PAYLOAD;
	} catch {
		return DEFAULT_PLAYER_PAYLOAD;
	}
}

export const GET = async ({ locals, params }: RequestEvent) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const prisma = getPrismaClient();
	const game = await prisma.game.findUnique({
		where: { gameCode: params.gameCode },
		select: {
			gameCode: true,
			status: true,
			currentTurn: true,
			user1Id: true,
			user2Id: true,
			player1: { select: { deck: true } },
			player2: { select: { deck: true } }
		}
	});

	if (!game) {
		return json({ error: 'Game not found' }, { status: 404 });
	}

	const userId = locals.user.id;
	if (game.user1Id !== userId && game.user2Id !== userId) {
		return json({ error: 'Forbidden' }, { status: 403 });
	}

	if (game.status !== 'active' || !game.user2Id) {
		return json({ gameCode: game.gameCode, status: 'waiting' });
	}

	return json({
		gameCode: game.gameCode,
		status: 'active',
		currentTurn: game.currentTurn,
		players: [parseDeckPayload(game.player1.deck), parseDeckPayload(game.player2.deck)]
	});
};
