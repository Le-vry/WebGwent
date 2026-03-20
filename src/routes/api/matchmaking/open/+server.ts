import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { getPrismaClient } from '$lib/server/prisma';

function parseDeckPayload(raw: string) {
	try {
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

export const GET = async ({ locals }: RequestEvent) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const prisma = getPrismaClient();
	const userId = locals.user.id;

	const waitingMatches = await prisma.game.findMany({
		where: {
			status: 'waiting',
			user2Id: null
		},
		orderBy: { id: 'desc' },
		select: {
			gameCode: true,
			user1Id: true,
			createdAt: true,
			user1: { select: { username: true } },
			player1: { select: { deck: true } }
		}
	});

	const matches = waitingMatches.map((match) => {
		const payload = parseDeckPayload(match.player1.deck);
		const faction = payload?.[2]?.name ?? 'Unknown Faction';
		const leader = payload?.[1]?.name ?? 'Unknown Leader';

		return {
			gameCode: match.gameCode,
			hostName: match.user1.username,
			faction,
			leader,
			createdAt: match.createdAt,
			isMine: match.user1Id === userId
		};
	});

	return json({ matches });
};
