<script lang="ts">
	import { ui } from '$lib/state/ui.svelte';
	import ModePicker from '$lib/components/ModePicker.svelte';
	import Stage from '$lib/components/Stage.svelte';
	import EditorCanvas from '$lib/components/EditorCanvas.svelte';
</script>

<svelte:head>
	<title>stick-and-slap · the canvas editor that slaps</title>
	<meta
		name="description"
		content="A neubrutalist canvas editor for memes, thumbnails, and social posts. Drop a photo, slap on text + stickers, export PNG. 100% client-side, built with Svelte."
	/>
</svelte:head>

{#if !ui.modePicked}
	<ModePicker />
{:else}
	<Stage>
		{#snippet canvas()}
			<EditorCanvas />
		{/snippet}
	</Stage>
{/if}
