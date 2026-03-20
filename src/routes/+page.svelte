<script lang="ts">
	interface PageData {
		user: {
			id: string;
			username: string;
		} | null;
		reconnectMatch: {
			gameCode: string;
			status: string;
		} | null;
	}

	export let data: PageData;
</script>

<main>
	<section class="menu-shell">
		<h1>WebGwent</h1>
		<p class="subtitle">Classic battle menu</p>

		{#if data.user}
			<p class="welcome">Welcome back, {data.user.username}.</p>
			{#if data.reconnectMatch}
				<a
					href={`/gameboard?gameCode=${encodeURIComponent(data.reconnectMatch.gameCode)}`}
					class="reconnect-banner"
				>
					Reconnect to current match ({data.reconnectMatch.status})
				</a>
			{/if}
			<nav class="menu-list" aria-label="Game menu">
				<a href="/find-match" class="menu-item">Start Match</a>
				<a href="/card-select" class="menu-item">Deck Builder</a>
				<a href="/profile" class="menu-item">Profile</a>
				<a href="/sessions" class="menu-item">Active Sessions</a>
			</nav>
			<form method="POST" action="/logout" class="logout-form">
				<button type="submit" class="menu-item menu-item--danger">Quit to Desktop</button>
			</form>
		{:else}
			<p class="welcome">Choose an option to continue.</p>
			<nav class="menu-list" aria-label="Guest menu">
				<a href="/login" class="menu-item">Login</a>
				<a href="/register" class="menu-item">Register</a>
			</nav>
		{/if}
	</section>
</main>

<style>
	main {
		width: 100%;
		min-height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 1.2rem;
		background: radial-gradient(circle at top, #f5f7fb 0%, #e8edf5 100%);
	}

	.menu-shell {
		width: 100%;
		max-width: 460px;
		padding: 1.1rem;
		border: 1px solid #cfd6e3;
		border-radius: 10px;
		background: rgba(255, 255, 255, 0.95);
		box-shadow: 0 12px 30px rgba(20, 29, 45, 0.12);
	}

	h1 {
		font-size: 2rem;
		letter-spacing: 0.03em;
		text-transform: uppercase;
		text-align: center;
		margin: 0;
	}

	.subtitle {
		text-align: center;
		margin: 0.2rem 0 0.9rem;
		font-size: 0.95rem;
		color: #546179;
	}

	.welcome {
		margin: 0 0 0.85rem;
		text-align: center;
	}

	.menu-list {
		display: grid;
		gap: 0.55rem;
	}

	.reconnect-banner {
		display: block;
		margin: 0 0 0.7rem;
		padding: 0.65rem 0.8rem;
		border-radius: 0.45rem;
		border: 1px solid #8bc0ff;
		background: #e8f2ff;
		color: #123f73;
		text-decoration: none;
		text-align: center;
		font-weight: 600;
	}

	.reconnect-banner:hover {
		background: #d7e9ff;
	}

	.logout-form {
		margin-top: 0.55rem;
    }

	.menu-item {
		display: block;
		width: 100%;
		text-align: center;
		text-decoration: none;
		color: #111827;
		font: inherit;
		padding: 0.65rem 0.8rem;
		border: 1px solid #d1d5db;
		border-radius: 0.45rem;
		background: #fff;
		cursor: pointer;
	}

	.menu-item:hover {
		background: #f2f5fb;
	}

	.menu-item--danger {
		border-color: #f2c6c6;
		color: #8d2525;
		background: #fff8f8;
	}

	button {
		width: 100%;
    }

	p {
		margin: 0;
	}
</style>

