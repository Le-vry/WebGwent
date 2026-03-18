type MatchRole = 'p1' | 'p2';

type TimeoutHandle = ReturnType<typeof setTimeout>;

type DisconnectState = {
	role: MatchRole;
	deadlineMs: number;
	timer: TimeoutHandle;
};

type PresenceState = {
	p1Connections: number;
	p2Connections: number;
	disconnect: DisconnectState | null;
};

type TimeoutHandler = (details: { role: MatchRole; deadlineMs: number }) => Promise<void>;

const RECONNECT_GRACE_MS = 2 * 60 * 1000;
const presenceByGame = new Map<string, PresenceState>();

function ensurePresence(gameCode: string): PresenceState {
	let state = presenceByGame.get(gameCode);
	if (!state) {
		state = {
			p1Connections: 0,
			p2Connections: 0,
			disconnect: null
		};
		presenceByGame.set(gameCode, state);
	}
	return state;
}

function clearDisconnect(state: PresenceState) {
	if (!state.disconnect) return;
	clearTimeout(state.disconnect.timer);
	state.disconnect = null;
}

function maybeDeletePresence(gameCode: string, state: PresenceState) {
	if (state.p1Connections === 0 && state.p2Connections === 0 && !state.disconnect) {
		presenceByGame.delete(gameCode);
	}
}

function startDisconnectGrace(
	gameCode: string,
	state: PresenceState,
	role: MatchRole,
	onTimeout: TimeoutHandler
) {
	if (state.disconnect) return;

	const deadlineMs = Date.now() + RECONNECT_GRACE_MS;
	const timer = setTimeout(() => {
		onTimeout({ role, deadlineMs }).catch(() => {
			// Avoid crashing timer loop if DB update fails.
		});

		const latest = presenceByGame.get(gameCode);
		if (!latest || latest.disconnect?.timer !== timer) return;

		latest.disconnect = null;
		maybeDeletePresence(gameCode, latest);
	}, RECONNECT_GRACE_MS);

	state.disconnect = { role, deadlineMs, timer };
}

export function registerMatchConnection(
	gameCode: string,
	role: MatchRole,
	onTimeout: TimeoutHandler
): () => void {
	const state = ensurePresence(gameCode);

	if (role === 'p1') state.p1Connections += 1;
	else state.p2Connections += 1;

	if (state.disconnect?.role === role) {
		clearDisconnect(state);
	}

	let unregistered = false;
	return () => {
		if (unregistered) return;
		unregistered = true;

		if (role === 'p1') state.p1Connections = Math.max(0, state.p1Connections - 1);
		else state.p2Connections = Math.max(0, state.p2Connections - 1);

		const roleConnections = role === 'p1' ? state.p1Connections : state.p2Connections;
		if (roleConnections === 0) {
			startDisconnectGrace(gameCode, state, role, onTimeout);
		}

		maybeDeletePresence(gameCode, state);
	};
}

export function getMatchDisconnectInfo(gameCode: string): { role: MatchRole; deadlineMs: number } | null {
	const state = presenceByGame.get(gameCode);
	if (!state?.disconnect) return null;

	return {
		role: state.disconnect.role,
		deadlineMs: state.disconnect.deadlineMs
	};
}

export function getReconnectGraceMs() {
	return RECONNECT_GRACE_MS;
}
