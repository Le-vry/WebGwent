<script>
	import { base } from '$app/paths';
</script>	

<main>
	<img src="Gwent header.png" alt="Gwent header">
	<a href="{base}/card-select">Play Gwent</a>
</main>


<style>
	main {
		
		background:url("my-website\static\Background.png");
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
</style>