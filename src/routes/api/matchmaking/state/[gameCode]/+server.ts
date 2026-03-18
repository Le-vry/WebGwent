import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { getPrismaClient } from '$lib/server/prisma';

function parseState(raw: string) {
	try {
		const parsed = JSON.parse(raw);
		return parsed && typeof parsed === 'object' && parsed.__version === 1 ? parsed : null;
	} catch {
		return null;
	}
}

async function getAuthorizedGame(event: RequestEvent) {
	const { locals, params } = event;
	if (!locals.user) return { error: json({ error: 'Unauthorized' }, { status: 401 }) };

	const prisma = getPrismaClient();
	const game = await prisma.game.findUnique({
		where: { gameCode: params.gameCode },
		select: {
			id: true,
			gameCode: true,
			currentTurn: true,
			user1Id: true,
			user2Id: true,
			boardStateId: true,
			boardState: { select: { p1Melee: true } }
		}
	});

	if (!game) return { error: json({ error: 'Game not found' }, { status: 404 }) };
	if (game.user1Id !== locals.user.id && game.user2Id !== locals.user.id) {
		return { error: json({ error: 'Forbidden' }, { status: 403 }) };
	}

	return { game, prisma };
}

export const GET = async (event: RequestEvent) => {
	const auth = await getAuthorizedGame(event);
	if ('error' in auth) return auth.error;

	const persisted = parseState(auth.game.boardState.p1Melee);
	return json({ gameCode: auth.game.gameCode, state: persisted });
};

export const POST = async (event: RequestEvent) => {
	const auth = await getAuthorizedGame(event);
	if ('error' in auth) return auth.error;

	const body = await event.request.json().catch(() => null);
	const state = body?.state;
	const role = body?.role;

	if (!state || typeof state !== 'object') {
		return json({ error: 'Invalid state payload' }, { status: 400 });
	}

	if (role !== 'p1' && role !== 'p2') {
		return json({ error: 'Invalid role payload' }, { status: 400 });
	}

	const isP1User = auth.game.user1Id === event.locals.user?.id;
	const expectedRoleForUser = isP1User ? 'p1' : 'p2';
	if (role !== expectedRoleForUser) {
		return json({ error: 'Role does not match authenticated user' }, { status: 403 });
	}

	const currentTurnRole = auth.game.currentTurn === 2 ? 'p2' : 'p1';
	if (role !== currentTurnRole) {
		return json({ error: 'It is not your turn' }, { status: 409 });
	}

	const versioned = {
		...state,
		__version: 1,
		updatedAt: Date.now()
	};

	await auth.prisma.$transaction([
		auth.prisma.boardState.update({
			where: { id: auth.game.boardStateId },
			data: { p1Melee: JSON.stringify(versioned) }
		}),
		auth.prisma.game.update({
			where: { id: auth.game.id },
			data: {
				currentTurn: typeof state.turn === 'number'
					? (Math.round(state.turn) === 2 ? 2 : 1)
					: undefined
			}
		})
	]);

	return json({ ok: true });
};
