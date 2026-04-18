<svelte:head>
	<title>stick-and-slap · the canvas editor that slaps</title>
	<meta
		name="description"
		content="A neubrutalist canvas editor for memes, thumbnails, and social posts. Drop a photo, slap on text + stickers, export PNG. 100% client-side, built with Svelte."
	/>
</svelte:head>

<main>
	<h1>stick-and-slap</h1>
	<p class="tagline">the canvas editor that slaps</p>
</main>

<style>
	main {
		min-height: 100dvh;
		display: grid;
		place-items: center;
		gap: 12px;
	}

	h1 {
		font-family: var(--font-display);
		font-size: 64px;
		letter-spacing: -0.02em;
		margin: 0;
	}

	.tagline {
		font-family: var(--font-hand);
		font-size: 28px;
		color: var(--color-pink);
		margin: 0;
		transform: rotate(-1.6deg);
	}
</style>
