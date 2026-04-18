<script lang="ts">
	import type { Layer, ImageLayer } from '$lib/state/scene.svelte';
	import { selection } from '$lib/state/selection.svelte';

	interface Props {
		layer: Layer;
	}

	let { layer }: Props = $props();

	const selected = $derived(selection.has(layer.id));

	function onClick(e: MouseEvent) {
		e.stopPropagation();
		if (e.shiftKey) {
			selection.toggle(layer.id);
		} else {
			selection.select(layer.id);
		}
	}
</script>

<div
	class="layer"
	data-id={layer.id}
	data-type={layer.type}
	data-selected={selected}
	style="
		--x: {layer.x}px;
		--y: {layer.y}px;
		--w: {layer.w}px;
		--h: {layer.h}px;
		--rot: {layer.rotation}rad;
		--opacity: {layer.opacity};
	"
	onclick={onClick}
	role="presentation"
>
	{#if layer.type === 'image'}
		{@const img = layer as ImageLayer}
		<img src={img.src} alt="" draggable={false} />
	{:else if layer.type === 'text'}
		<span class="placeholder">text layer</span>
	{:else if layer.type === 'shape'}
		<span class="placeholder">shape layer</span>
	{:else if layer.type === 'sticker'}
		<span class="placeholder">sticker layer</span>
	{/if}
</div>

<style>
	.layer {
		position: absolute;
		left: 0;
		top: 0;
		width: var(--w);
		height: var(--h);
		transform: translate(var(--x), var(--y)) rotate(var(--rot));
		transform-origin: center center;
		opacity: var(--opacity);
		pointer-events: auto;
		cursor: pointer;
	}

	/* selection outline drawn by TransformBox */

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		pointer-events: none;
		user-select: none;
	}

	.placeholder {
		display: grid;
		place-items: center;
		width: 100%;
		height: 100%;
		background: rgba(255, 180, 0, 0.3);
		font-family: var(--font-data);
		font-size: 11px;
	}
</style>
