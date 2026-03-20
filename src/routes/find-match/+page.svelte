<script>
	// @ts-nocheck
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import { goto } from '$app/navigation';

	const SAVED_DECKS_KEY = 'webgwent.savedDecks.v1';

	let savedDecksByFaction = {};
	let factionOptions = [];
	let selectedFaction = '';
	let matches = [];
	let loading = false;
	let actionBusy = false;
	let status = '';
	let statusError = false;
	let pollTimer = null;

	function setStatus(message, isError = false) {
		status = message;
		statusError = isError;
	}

	function loadSavedDecks() {
		if (typeof window === 'undefined') return;
		try {
			const raw = window.localStorage.getItem(SAVED_DECKS_KEY);
			savedDecksByFaction = raw ? JSON.parse(raw) : {};
		} catch {
			savedDecksByFaction = {};
		}

		factionOptions = Object.keys(savedDecksByFaction);
		selectedFaction = factionOptions[0] ?? '';
	}

	function getSelectedDeckPayload() {
		if (!selectedFaction) return null;
		return savedDecksByFaction[selectedFaction] ?? null;
	}

	async function loadOpenMatches() {
		loading = true;
		try {
			const res = await fetch('/api/matchmaking/open');
			const result = await res.json().catch(() => ({}));
			if (!res.ok) {
				setStatus(result?.error ?? 'Could not load open matches.', true);
				return;
			}

			matches = result?.matches ?? [];
			if (!statusError) {
				setStatus(matches.length ? '' : 'No open matches yet. Create one to start.', false);
			}
		} catch {
			setStatus('Network error while loading open matches.', true);
		} finally {
			loading = false;
		}
	}

	async function createMatch() {
		const payload = getSelectedDeckPayload();
		if (!payload) {
			setStatus('Save a faction deck first in Deck Builder.', true);
			return;
		}

		actionBusy = true;
		setStatus('Creating match room...', false);

		try {
			const res = await fetch('/api/matchmaking/create', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify(payload)
			});
			const result = await res.json().catch(() => ({}));
			if (!res.ok) {
				setStatus(result?.error ?? 'Could not create match.', true);
				if (result?.gameCode) {
					goto(base + `/gameboard?gameCode=${encodeURIComponent(result.gameCode)}`);
				}
				return;
			}

			goto(base + `/gameboard?gameCode=${encodeURIComponent(result.gameCode)}`);
		} catch {
			setStatus('Network error while creating match.', true);
		} finally {
			actionBusy = false;
		}
	}

	async function joinMatch(gameCode) {
		const payload = getSelectedDeckPayload();
		if (!payload) {
			setStatus('Save a faction deck first in Deck Builder.', true);
			return;
		}

		actionBusy = true;
		setStatus(`Joining match ${gameCode}...`, false);

		try {
			const res = await fetch(`/api/matchmaking/join/${encodeURIComponent(gameCode)}`, {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify(payload)
			});
			const result = await res.json().catch(() => ({}));
			if (!res.ok) {
				setStatus(result?.error ?? 'Could not join match.', true);
				if (result?.gameCode) {
					goto(base + `/gameboard?gameCode=${encodeURIComponent(result.gameCode)}`);
				}
				await loadOpenMatches();
				return;
			}

			goto(base + `/gameboard?gameCode=${encodeURIComponent(result.gameCode)}`);
		} catch {
			setStatus('Network error while joining match.', true);
		} finally {
			actionBusy = false;
		}
	}

	onMount(async () => {
		loadSavedDecks();
		await loadOpenMatches();
		pollTimer = window.setInterval(loadOpenMatches, 4000);

		return () => {
			if (pollTimer) window.clearInterval(pollTimer);
		};
	});
</script>

<main class="lobby">
	<h1>Find Match</h1>
	<p class="subtitle">Create a room or join an open match using your saved faction deck.</p>

	<div class="controls">
		<label for="faction">Saved Faction</label>
		<select id="faction" bind:value={selectedFaction}>
			{#if !factionOptions.length}
				<option value="">No saved decks</option>
			{:else}
				{#each factionOptions as faction}
					<option value={faction}>{faction}</option>
				{/each}
			{/if}
		</select>

		<div class="actions">
			<button on:click={createMatch} disabled={actionBusy || !selectedFaction}>Create Match</button>
			<button class="secondary" on:click={() => goto(base + '/card-select')}>Open Deck Builder</button>
			<button class="secondary" on:click={loadOpenMatches} disabled={loading}>Refresh</button>
		</div>
	</div>

	{#if status}
		<p class:status-error={statusError} class="status">{status}</p>
	{/if}

	<section class="match-list">
		<h2>Open Matches</h2>
		{#if !matches.length}
			<p class="empty">No rooms available right now.</p>
		{:else}
			{#each matches as match}
				<div class="match-row">
					<div>
						<p class="code">{match.gameCode}</p>
						<p>{match.hostName} - {match.faction} ({match.leader})</p>
					</div>
					{#if match.isMine}
						<button on:click={() => goto(base + `/gameboard?gameCode=${encodeURIComponent(match.gameCode)}`)}>
							Open
						</button>
					{:else}
						<button on:click={() => joinMatch(match.gameCode)} disabled={actionBusy || !selectedFaction}>Join</button>
					{/if}
				</div>
			{/each}
		{/if}
	</section>
</main>

<style>
	.lobby {
		max-width: 820px;
		margin: 2rem auto;
		padding: 1rem;
	}

	h1 {
		margin: 0;
	}

	.subtitle {
		margin-top: 0.5rem;
		opacity: 0.8;
	}

	.controls {
		margin-top: 1.2rem;
		display: grid;
		gap: 0.6rem;
	}

	select {
		max-width: 320px;
	}

	.actions {
		display: flex;
		gap: 0.6rem;
		flex-wrap: wrap;
	}

	button {
		padding: 0.45rem 0.9rem;
	}

	.secondary {
		opacity: 0.85;
	}

	.status {
		margin: 0.9rem 0;
	}

	.status-error {
		color: #c20000;
	}

	.match-list {
		margin-top: 1rem;
		display: grid;
		gap: 0.6rem;
	}

	.match-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.7rem;
		border: 1px solid #d8d8d8;
		border-radius: 8px;
		gap: 0.8rem;
	}

	.code {
		font-weight: 700;
		margin: 0 0 0.2rem 0;
	}

	.empty {
		opacity: 0.8;
	}
</style>
