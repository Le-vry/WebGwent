import type { RequestEvent } from '@sveltejs/kit';
import { getOpenMatchesForUser, subscribeOpenMatchUpdates } from '$lib/server/openMatchUpdates';

function sseHeaders() {
	return {
		'content-type': 'text/event-stream',
		'cache-control': 'no-cache, no-transform',
		connection: 'keep-alive'
	};
}

export const GET = async ({ locals, request }: RequestEvent) => {
	if (!locals.user) {
		return new Response('Unauthorized', { status: 401 });
	}

	const userId = locals.user.id;
	const encoder = new TextEncoder();
	let cleanup = () => {};

	const stream = new ReadableStream<Uint8Array>({
		start(controller) {
			let closed = false;
			let lastSnapshot = '';
			let emitting = false;
			let pendingEmit = false;
			let unsubscribe = () => {};

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

			const emitMatches = async () => {
				if (closed) return;
				if (emitting) {
					pendingEmit = true;
					return;
				}

				emitting = true;
				try {
					const matches = await getOpenMatchesForUser(userId);
					const snapshot = JSON.stringify(matches);
					if (snapshot !== lastSnapshot) {
						lastSnapshot = snapshot;
						send('matches', { matches });
					}
				} finally {
					emitting = false;
					if (pendingEmit) {
						pendingEmit = false;
						emitMatches().catch(() => {
							// Best-effort refresh after coalescing rapid events.
						});
					}
				}
			};

			send('connected', { ok: true });
			emitMatches().catch(() => {
				send('error', { error: 'Could not load matches.' });
			});

			unsubscribe = subscribeOpenMatchUpdates(() => {
				emitMatches().catch(() => {
					// Keep stream alive and rely on future events.
				});
			});

			const heartbeat = setInterval(() => {
				safeEnqueue(encoder.encode(': ping\n\n'));
			}, 15000);

			cleanup = () => {
				if (closed) return;
				closed = true;
				unsubscribe();
				clearInterval(heartbeat);
				try {
					controller.close();
				} catch {
					// Stream may already be closed by runtime.
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
