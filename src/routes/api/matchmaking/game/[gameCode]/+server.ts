import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { getPrismaClient } from '$lib/server/prisma';

const DEFAULT_PLAYER_PAYLOAD = [[], { name: 'Ballista1' }, { name: 'Northern Realms', ability: '' }];

function parsePersistedState(raw: string) {
	try {
		const parsed = JSON.parse(raw);
		return parsed && typeof parsed === 'object' && parsed.__version === 1 ? parsed : null;
	} catch {
		return null;
	}
}

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
			user1: { select: { username: true } },
			user2: { select: { username: true } },
			boardState: { select: { p1Melee: true } },
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

	if (game.status !== 'waiting' && game.status !== 'active') {
		return json({ error: 'Match is no longer active', status: game.status }, { status: 410 });
	}

	if (game.status !== 'active' || !game.user2Id) {
		return json({
			gameCode: game.gameCode,
			status: 'waiting',
			role: game.user1Id === userId ? 'p1' : 'p2'
		});
	}

	const persistedState = parsePersistedState(game.boardState.p1Melee);

	return json({
		gameCode: game.gameCode,
		status: 'active',
		role: game.user1Id === userId ? 'p1' : 'p2',
		currentTurn: game.currentTurn,
		state: persistedState,
		playerNames: {
			p1: game.user1.username,
			p2: game.user2?.username ?? 'Player 2'
		},
		players: [parseDeckPayload(game.player1.deck), parseDeckPayload(game.player2.deck)]
	});
};
