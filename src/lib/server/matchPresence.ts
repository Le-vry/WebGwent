type MatchRole = 'p1' | 'p2';

type TimeoutHandle = ReturnType<typeof setTimeout>;

type DisconnectState = {
	role: MatchRole;
	deadlineMs: number;
	timer: TimeoutHandle;
};

type PendingDisconnectState = {
	role: MatchRole;
	timer: TimeoutHandle;
};

type PresenceState = {
	p1Connections: number;
	p2Connections: number;
	pendingDisconnect: PendingDisconnectState | null;
	disconnect: DisconnectState | null;
};

type TimeoutHandler = (details: { role: MatchRole; deadlineMs: number }) => Promise<void>;

const RECONNECT_GRACE_MS = 2 * 60 * 1000;
const DISCONNECT_DEBOUNCE_MS = 7000;
const presenceByGame = new Map<string, PresenceState>();

function ensurePresence(gameCode: string): PresenceState {
	let state = presenceByGame.get(gameCode);
	if (!state) {
		state = {
			p1Connections: 0,
			p2Connections: 0,
			pendingDisconnect: null,
			disconnect: null
		};
		presenceByGame.set(gameCode, state);
	}
	return state;
}

function clearPendingDisconnect(state: PresenceState, role?: MatchRole) {
	if (!state.pendingDisconnect) return;
	if (role && state.pendingDisconnect.role !== role) return;

	clearTimeout(state.pendingDisconnect.timer);
	state.pendingDisconnect = null;
}

function clearDisconnect(state: PresenceState) {
	if (!state.disconnect) return;
	clearTimeout(state.disconnect.timer);
	state.disconnect = null;
}

function maybeDeletePresence(gameCode: string, state: PresenceState) {
	if (
		state.p1Connections === 0 &&
		state.p2Connections === 0 &&
		!state.pendingDisconnect &&
		!state.disconnect
	) {
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

function scheduleDisconnectGrace(
	gameCode: string,
	state: PresenceState,
	role: MatchRole,
	onTimeout: TimeoutHandler
) {
	if (state.disconnect || state.pendingDisconnect) return;

	const timer = setTimeout(() => {
		const latest = presenceByGame.get(gameCode);
		if (!latest || latest.pendingDisconnect?.timer !== timer) return;

		latest.pendingDisconnect = null;
		const roleConnections = role === 'p1' ? latest.p1Connections : latest.p2Connections;
		if (roleConnections > 0) {
			maybeDeletePresence(gameCode, latest);
			return;
		}

		startDisconnectGrace(gameCode, latest, role, onTimeout);
	}, DISCONNECT_DEBOUNCE_MS);

	state.pendingDisconnect = { role, timer };
}

export function registerMatchConnection(
	gameCode: string,
	role: MatchRole,
	onTimeout: TimeoutHandler
): () => void {
	const state = ensurePresence(gameCode);

	if (role === 'p1') state.p1Connections += 1;
	else state.p2Connections += 1;

	clearPendingDisconnect(state, role);

	if (state.disconnect?.role === role) {
		clearDisconnect(state);
	}

	let unregistered = false;
	return () => {
		if (unregistered) return;
		unregistered = true;

		if (role === 'p1') state.p1Connections = Math.max(0, state.p1Connections - 1);
		else state.p2Connections = Math.max(0, state.p2Connections - 1);

		if (state.p1Connections === 0 && state.p2Connections === 0) {
			// If both players leave, terminate immediately instead of waiting through reconnect grace.
			clearPendingDisconnect(state);
			clearDisconnect(state);
			onTimeout({ role, deadlineMs: Date.now() }).catch(() => {
				// Avoid crashing stream cleanup if DB update fails.
			});
			maybeDeletePresence(gameCode, state);
			return;
		}

		const roleConnections = role === 'p1' ? state.p1Connections : state.p2Connections;
		if (roleConnections === 0) {
			scheduleDisconnectGrace(gameCode, state, role, onTimeout);
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
