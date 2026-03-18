import type { RequestEvent } from '@sveltejs/kit';
import { getPrismaClient } from '$lib/server/prisma';
import { getMatchDisconnectInfo, getReconnectGraceMs, registerMatchConnection } from '$lib/server/matchPresence';

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

	const gameCode = params.gameCode;
	if (!gameCode) {
		return new Response('Bad Request', { status: 400 });
	}

	const prisma = getPrismaClient();
	const game = await prisma.game.findUnique({
		where: { gameCode },
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

	const role = game.user1Id === locals.user.id ? 'p1' : 'p2';
	const unregisterPresence = registerMatchConnection(gameCode, role, async () => {
		await prisma.game.updateMany({
			where: {
				gameCode,
				status: 'active'
			},
			data: {
				status: 'cancelled'
			}
		});
	});

	const encoder = new TextEncoder();
	let cleanup = () => {};

	const stream = new ReadableStream<Uint8Array>({
		start(controller) {
			let lastPayload = '';
			let lastGameSnapshot = '';
			let closed = false;

			const safeEnqueue = (chunk: Uint8Array) => {
				if (closed) return;
				try {
					controller.enqueue(chunk);
				} catch {
					closed = true;
				}
			};

			const send = (event: string, data: unknown) => {
				safeEnqueue(encoder.encode(`event: ${event}\n`));
				safeEnqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
			};

			send('connected', {
				ok: true,
				gameCode,
				role,
				reconnectGraceMs: getReconnectGraceMs()
			});

			const tick = async () => {
				if (closed) return;
				const latest = await prisma.game.findUnique({
					where: { gameCode },
					select: {
						status: true,
						currentTurn: true,
						user2Id: true,
						boardState: { select: { p1Melee: true } }
					}
				});
				if (!latest) return;

				const disconnect = getMatchDisconnectInfo(gameCode);

				const gameSnapshot = JSON.stringify({
					status: latest.status,
					currentTurn: latest.currentTurn,
					hasOpponent: Boolean(latest.user2Id),
					disconnect
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
			}, 2000);

			tick().catch(() => {
				// Initial sync is best-effort.
			});

			const heartbeat = setInterval(() => {
				safeEnqueue(encoder.encode(': ping\n\n'));
			}, 15000);

			cleanup = () => {
				if (closed) return;
				closed = true;
				unregisterPresence();
				clearInterval(interval);
				clearInterval(heartbeat);
				try {
					controller.close();
				} catch {
					// Stream may already be closed by the runtime.
				}
			};

			request.signal.addEventListener('abort', cleanup);
		},
		cancel() {
			cleanup();
		}
	});

	return new Response(stream, { headers: sseHeaders() });
};
