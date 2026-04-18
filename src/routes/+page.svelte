<script lang="ts">
	import { ui } from '$lib/state/ui.svelte';
	import ModePicker from '$lib/components/ModePicker.svelte';
	import Stage from '$lib/components/Stage.svelte';
	import EditorCanvas from '$lib/components/EditorCanvas.svelte';
	import ExportDialog from '$lib/components/ExportDialog.svelte';
	import Toolbar from '$lib/components/Toolbar.svelte';
	import LayerPanel from '$lib/components/LayerPanel.svelte';
	import Inspector from '$lib/components/Inspector.svelte';

	$effect(() => {
		if (ui.modePicked) {
			queueMicrotask(() => {
				const target = document.querySelector<HTMLButtonElement>(
					'.toolbar button:not(:disabled)'
				);
				target?.focus();
			});
		}
	});
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
		{#snippet toolbar()}
			<Toolbar />
		{/snippet}
		{#snippet canvas()}
			<EditorCanvas />
		{/snippet}
		{#snippet panels()}
			<LayerPanel />
			<Inspector />
		{/snippet}
	</Stage>
{/if}

<ExportDialog />
