<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import archivoBlackUrl from '@fontsource/archivo-black/files/archivo-black-latin-400-normal.woff2?url';
	import spaceGroteskUrl from '@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2?url';
	import caveatUrl from '@fontsource/caveat/files/caveat-latin-400-normal.woff2?url';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
	<link rel="preload" as="font" type="font/woff2" href={archivoBlackUrl} crossorigin="anonymous" />
	<link rel="preload" as="font" type="font/woff2" href={spaceGroteskUrl} crossorigin="anonymous" />
	<link rel="preload" as="font" type="font/woff2" href={caveatUrl} crossorigin="anonymous" />
</svelte:head>

{@render children()}
