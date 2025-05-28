<script>
	import { base } from '$app/paths';
	import { onMount } from 'svelte';

	let w 
	let h

	onMount(() => {
		w = window.innerWidth;
		h = window.innerHeight;
	});
</script>	

	{#if w > 600 && h > 600}
	<main>
		<img src="Gwent header.png" alt="Gwent header">
		<a href="{base}/card-select">Play Gwent</a>
		<article class="about">
		<p>WebGwent is a fan-made project and is not affiliated with CD Projekt Red.</p>
		<p>All rights to music and images are owned by CD Project Red <br> and are NOT made or owned by me</p>
		</article>
	</main>

	{:else}
		<div class= "mobile-warning">
			<h1>WebGwent is not supported on mobile devices.</h1>
			<p>Please use a desktop or laptop computer to play.</p>
		</div>
	{/if}



<style>
	main {
		
		background-image: url("/Background.png");
		background-size:cover;
		height: 100vh;
		width: 100vw;
		display: flex;
		flex-direction: column;
		align-items: center;
		overflow: hidden;
	}

	img {
		width: 30vw;
		height: 30vh;
	}

	.mobile-warning {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100vh;
		background-color: #fffcfc;
		color: #000000;
		text-align: center;
		padding: 20px;
	}

	.about {
		position: absolute;
		top: 80%;
		left: 2%;
		padding: 20px;
		border-radius: 10px;
		margin-top: 20px;
		font-size: small;
		
	}
</style>