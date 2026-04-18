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

	<!-- Override fontsource's font-display:swap with :optional for hero faces so
	     the browser never does a late swap that reflows the huge wordmark. -->
	{@html `<style>
		@font-face {
			font-family: 'Archivo Black';
			font-style: normal;
			font-weight: 400;
			font-display: optional;
			src: url('${archivoBlackUrl}') format('woff2');
		}
		@font-face {
			font-family: 'Space Grotesk Variable';
			font-style: normal;
			font-weight: 300 700;
			font-display: optional;
			src: url('${spaceGroteskUrl}') format('woff2-variations');
		}
		@font-face {
			font-family: 'Caveat';
			font-style: normal;
			font-weight: 400;
			font-display: optional;
			src: url('${caveatUrl}') format('woff2');
		}
	</style>`}
</svelte:head>

{@render children()}
