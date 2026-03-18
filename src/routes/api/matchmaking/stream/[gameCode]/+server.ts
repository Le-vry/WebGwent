import type { RequestEvent } from '@sveltejs/kit';
import { getPrismaClient } from '$lib/server/prisma';

function sseHeaders() {
	return {
		'content-type': 'text/event-stream',
		'cache-control': 'no-cache, no-transform',
		connection: 'keep-alive'
	};
}

export const GET = async ({ locals, params, request }: RequestEvent) => {
	if (!locals.user) {
		return new Response('Unauthorized', { status: 401 });
	}

	const prisma = getPrismaClient();
	const game = await prisma.game.findUnique({
		where: { gameCode: params.gameCode },
		select: {
			id: true,
			user1Id: true,
			user2Id: true,
			boardState: { select: { p1Melee: true } }
		}
	});

	if (!game) {
		return new Response('Not Found', { status: 404 });
	}
	if (game.user1Id !== locals.user.id && game.user2Id !== locals.user.id) {
		return new Response('Forbidden', { status: 403 });
	}

	const encoder = new TextEncoder();

	const stream = new ReadableStream<Uint8Array>({
		start(controller) {
			let lastPayload = '';
			let lastGameSnapshot = '';

			const send = (event: string, data: unknown) => {
				controller.enqueue(encoder.encode(`event: ${event}\n`));
				controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
			};

			send('connected', { ok: true, gameCode: params.gameCode });

			const tick = async () => {
				const latest = await prisma.game.findUnique({
					where: { gameCode: params.gameCode },
					select: {
						status: true,
						currentTurn: true,
						user2Id: true,
						boardState: { select: { p1Melee: true } }
					}
				});
				if (!latest) return;

				const gameSnapshot = JSON.stringify({
					status: latest.status,
					currentTurn: latest.currentTurn,
					hasOpponent: Boolean(latest.user2Id)
				});
				if (gameSnapshot !== lastGameSnapshot) {
					lastGameSnapshot = gameSnapshot;
					send('game', JSON.parse(gameSnapshot));
				}

				const payload = latest.boardState.p1Melee || '';
				if (payload && payload !== lastPayload) {
					lastPayload = payload;
					send('state', JSON.parse(payload));
				}
			};

			const interval = setInterval(() => {
				tick().catch(() => {
					// Keep stream alive; client retries on failure.
				});
			}, 1000);

			tick().catch(() => {
				// Initial sync is best-effort.
			});

			const heartbeat = setInterval(() => {
				controller.enqueue(encoder.encode(': ping\n\n'));
			}, 15000);

			request.signal.addEventListener('abort', () => {
				clearInterval(interval);
				clearInterval(heartbeat);
				controller.close();
			});
		}
	});

	return new Response(stream, { headers: sseHeaders() });
};
