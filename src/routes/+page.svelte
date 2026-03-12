<script>
	import { base } from '$app/paths';
</script>	

<main>
	<!-- Picture element for responsive WebP with PNG fallback -->
	<picture>
		<source srcset="Gwent header.webp" type="image/webp">
		<source srcset="Gwent header.png" type="image/png">
		<img src="Gwent header.png" alt="Gwent header" loading="lazy">
	</picture>
	<a href="{base}/card-select">Play Gwent</a>
	<article class="about">
	<p>WebGwent is a fan-made project and is not affiliated with CD Projekt Red.</p>
	<p>All rights to music and images are owned by CD Project Red <br> and are NOT made or owned by me</p>
	</article>
</main>

<div class="mobile-warning">
	<h1>WebGwent is not supported on mobile devices.</h1>
	<p>Please use a desktop or laptop computer to play.</p>
</div>

<style>
	main {
		background-image: url("/Background.webp");
		background-image: image-set(url("/Background.webp") type("image/webp"), url("/Background.png") type("image/png"));
		background-size: cover;
		height: 100vh;
		width: 100vw;
		display: flex;
		flex-direction: column;
		align-items: center;
		overflow: hidden;
	}

	picture, img {
		width: 30vw;
		height: 30vh;
		object-fit: contain;
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

	.mobile-warning {
		display: none;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100vh;
		background-color: #fffcfc;
		color: #000;
		text-align: center;
		padding: 20px;
	}

	@media (max-width: 600px) or (max-height: 600px) {
		main {
			display: none;
		}

		.mobile-warning {
			display: flex;
		}
	}
</style>