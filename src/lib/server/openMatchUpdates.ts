import { getPrismaClient } from '$lib/server/prisma';

export type OpenMatchView = {
	gameCode: string;
	hostName: string;
	faction: string;
	leader: string;
	isMine: boolean;
};

function parseDeckPayload(raw: string) {
	try {
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

const listeners = new Set<() => void>();

export function subscribeOpenMatchUpdates(listener: () => void) {
	listeners.add(listener);
	return () => listeners.delete(listener);
}

export function notifyOpenMatchUpdates() {
	for (const listener of listeners) {
		try {
			listener();
		} catch {
			// Ignore listener failures so a broken connection does not block others.
		}
	}
}

export async function getOpenMatchesForUser(userId: string): Promise<OpenMatchView[]> {
	const prisma = getPrismaClient();
	const waitingMatches = await prisma.game.findMany({
		where: {
			status: 'waiting',
			user2Id: null
		},
		orderBy: { id: 'desc' },
		select: {
			gameCode: true,
			user1Id: true,
			user1: { select: { username: true } },
			player1: { select: { deck: true } }
		}
	});

	return waitingMatches.map((match) => {
		const payload = parseDeckPayload(match.player1.deck);
		const faction = payload?.[2]?.name ?? 'Unknown Faction';
		const leader = payload?.[1]?.name ?? 'Unknown Leader';

		return {
			gameCode: match.gameCode,
			hostName: match.user1.username,
			faction,
			leader,
			isMine: match.user1Id === userId
		};
	});
}
