<script lang="ts">
	import { page } from '$app/stores';

	$: bypassAuthShell =
		$page.url.pathname.startsWith('/card-select') ||
		$page.url.pathname.startsWith('/gameboard');
</script>

{#if bypassAuthShell}
	<slot />
{:else}
	<section class="auth-shell">
		<slot />
	</section>
{/if}

<style>
	.auth-shell {
		flex: 1;
		width: 100%;
		max-width: 960px;
		margin: 0 auto;
		padding: 1.25rem 1rem;
	}
</style>
