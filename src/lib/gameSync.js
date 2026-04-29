import { goto } from '$app/navigation';
import { base } from '$app/paths';

export class GameSync {
	constructor(ctx) {
		this.ctx = ctx;
		this.sseConnection = null;
		this.syncTimer = null;
		this.waitingPollTimer = null;
		this.waitingPollDelay = 2000;
		this.waitingPollInFlight = false;
	}

	async pushStateToServer(force = false) {
		if (!this.ctx.getGameCode() || this.ctx.getMatchmakingStatus() !== 'active') return;
		if (!force && !this.ctx.getIsMyTurn()) return;

		const statePayload = this.ctx.exportMatchState();
		console.log('[Push State]', {
			force,
			myRole: this.ctx.getMyRole()
		});

		try {
			const res = await fetch(`/api/matchmaking/state/${encodeURIComponent(this.ctx.getGameCode())}`, {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					state: statePayload,
					role: this.ctx.getMyRole()
				})
			});
			if (!res.ok) {
				console.warn('[Push State] Server returned:', res.status);
			}
		} catch (error) {
			console.error('Failed to sync match state:', error);
		}
	}

	queueStateSync() {
		if (
			this.ctx.getSuppressStateSync() ||
			!this.ctx.getGameCode() ||
			this.ctx.getMatchmakingStatus() !== 'active' ||
			!this.ctx.getIsMyTurn()
		) return;
		
		if (this.syncTimer) window.clearTimeout(this.syncTimer);
		this.syncTimer = window.setTimeout(() => {
			this.pushStateToServer();
			this.syncTimer = null;
		}, 250);
	}

	startSseStream(code) {
		if (this.sseConnection) this.sseConnection.close();

		this.sseConnection = new EventSource(`/api/matchmaking/stream/${encodeURIComponent(code)}`);
		this.sseConnection.addEventListener('game', (event) => {
			try {
				const meta = JSON.parse(event.data);
				console.log('[SSE:game]', {
					status: meta.status,
					currentTurn: meta.currentTurn,
					disconnect: meta.disconnect
				});

				if (typeof meta.currentTurn === 'number') {
					this.ctx.setTurn(meta.currentTurn);
				}

				if (meta.status === 'active' && this.ctx.getMatchmakingStatus() !== 'active') {
					console.log('[SSE:game] Match transitioned to active, hydrating state...');
					this.ctx.setMatchmakingStatus('active');
					this.fetchMatchGameState(code).catch((error) => {
						console.error('Failed to hydrate active match state:', error);
					});
				} else if (meta.status === 'waiting') {
					this.ctx.setMatchmakingStatus('waiting');
					this.ctx.clearDisconnectNotice();
				} else if (meta.status && meta.status !== 'active') {
					console.warn('[SSE:game] Match status changed to:', meta.status);
					const statusMsg = meta.status === 'cancelled' ? 'Match was cancelled.' : 'Match ended.';
					this.ctx.setMatchmakingError(`${statusMsg} Start a new match from card select.`);
					this.ctx.setMatchmakingStatus('');
					this.clearWaitingPoll();
					this.ctx.clearDisconnectNotice();
					if (this.sseConnection) {
						this.sseConnection.close();
						this.sseConnection = null;
					}

					if (meta.status === 'cancelled') {
						goto(
							base +
								'/?matchNotice=' +
								encodeURIComponent('Match cancelled because an opponent did not reconnect in time.')
						);
					} else if (meta.status === 'completed') {
						this.fetchMatchGameState(code).then(() => {
							this.ctx.onMatchCompleted();
						});
					}
				}

				if (
					meta.disconnect &&
					typeof meta.disconnect.deadlineMs === 'number' &&
					meta.disconnect.role !== this.ctx.getMyRole() &&
					meta.status === 'active'
				) {
					const opponentName = meta.disconnect.role === 'p1' ? this.ctx.getP1Username() : this.ctx.getP2Username();
					this.ctx.setDisconnectNotice(meta.disconnect.deadlineMs, opponentName);
				} else {
					this.ctx.clearDisconnectNotice();
				}
			} catch (error) {
				console.error('Failed to parse SSE game meta:', error);
			}
		});
		
		this.sseConnection.addEventListener('state', (event) => {
			try {
				const next = JSON.parse(event.data);
				this.ctx.applyMatchState(next);
				this.ctx.syncBoardState();
			} catch (error) {
				console.error('Failed to parse SSE state:', error);
			}
		});
	}

	async fetchMatchGameState(code) {
		let res;
		try {
			res = await fetch(`/api/matchmaking/game/${encodeURIComponent(code)}`);
		} catch (error) {
			this.ctx.setMatchmakingError(`Network error: Unable to reach game server.`);
			return { ready: false };
		}

		const raw = await res.text();
		let result = null;
		try {
			result = raw ? JSON.parse(raw) : null;
		} catch {
			result = null;
		}

		if (!res.ok) {
			const errorMsg = result?.error ?? `Could not load game state (HTTP ${res.status})`;
			this.ctx.setMatchmakingError(res.status === 410 ? 'Match no longer exists or was cancelled.' : errorMsg);
			if (res.status === 410) {
				this.ctx.setMatchmakingStatus('');
				this.clearWaitingPoll();
				this.ctx.clearDisconnectNotice();
			}
			return { ready: false };
		}

		if (!result || typeof result !== 'object') {
			this.ctx.setMatchmakingError(`Invalid game state response from server.`);
			return { ready: false };
		}

		this.ctx.setMatchmakingError('');

		if (result.status === 'waiting') {
			this.ctx.setMatchmakingStatus('waiting');
			this.ctx.setMyRole(result.role ?? this.ctx.getMyRole());
			this.ctx.clearDisconnectNotice();
			return { ready: false };
		}

		this.ctx.setMatchmakingStatus('active');
		this.ctx.setMyRole(result.role ?? this.ctx.getMyRole());
		if (result.playerNames) {
			this.ctx.setP1Username(result.playerNames.p1 ?? this.ctx.getP1Username());
			this.ctx.setP2Username(result.playerNames.p2 ?? this.ctx.getP2Username());
		}
		this.ctx.initializeFromPlayers(result.players);
		if (result.state) {
			this.ctx.applyMatchState(result.state);
		} else if (typeof result.currentTurn === 'number') {
			this.ctx.setTurn(result.currentTurn);
		}
		this.ctx.updatePlayersStore(result.players);
		return { ready: true };
	}

	clearWaitingPoll() {
		if (this.waitingPollTimer) {
			window.clearTimeout(this.waitingPollTimer);
			this.waitingPollTimer = null;
		}
		this.waitingPollInFlight = false;
	}

	scheduleWaitingPoll(code) {
		if (this.ctx.getMatchmakingStatus() === 'active') {
			this.clearWaitingPoll();
			return;
		}

		this.waitingPollTimer = window.setTimeout(async () => {
			if (this.waitingPollInFlight || this.ctx.getMatchmakingStatus() === 'active') {
				this.scheduleWaitingPoll(code);
				return;
			}

			this.waitingPollInFlight = true;
			const next = await this.fetchMatchGameState(code);
			this.waitingPollInFlight = false;

			if (next.ready) {
				this.clearWaitingPoll();
				this.queueStateSync();
				return;
			}

			this.waitingPollDelay = Math.min(this.waitingPollDelay + 500, 5000);
			this.scheduleWaitingPoll(code);
		}, this.waitingPollDelay);
	}

	cleanup() {
		this.clearWaitingPoll();
		if (this.syncTimer) clearTimeout(this.syncTimer);
		if (this.sseConnection) {
			this.sseConnection.close();
			this.sseConnection = null;
		}
	}
}
