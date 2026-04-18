<script lang="ts">
	import type { Layer, ImageLayer, TextLayer, ShapeLayer } from '$lib/state/scene.svelte';
	import { scene } from '$lib/state/scene.svelte';
	import { selection } from '$lib/state/selection.svelte';
	import { history } from '$lib/state/history.svelte';
	import { fontById } from '$lib/media/fonts';
	import { shapePath } from '$lib/geom/shapes';

	interface Props {
		layer: Layer;
	}

	let { layer }: Props = $props();

	const selected = $derived(selection.has(layer.id));
	let editing = $state(false);
	let textRef: HTMLDivElement | undefined = $state();

	function onClick(e: MouseEvent) {
		e.stopPropagation();
		if (e.shiftKey) {
			selection.toggle(layer.id);
		} else {
			selection.select(layer.id);
		}
	}

	function onDblClick(e: MouseEvent) {
		if (layer.type !== 'text') return;
		e.stopPropagation();
		history.commit();
		editing = true;
		queueMicrotask(() => {
			textRef?.focus();
			// Select all text on entry
			const range = document.createRange();
			if (textRef) {
				range.selectNodeContents(textRef);
				const sel = window.getSelection();
				sel?.removeAllRanges();
				sel?.addRange(range);
			}
		});
	}

	function onTextBlur() {
		editing = false;
		if (layer.type === 'text' && textRef) {
			if (textRef.innerText.trim() === '') {
				scene.removeLayer(layer.id);
				selection.clear();
				return;
			}
			scene.updateLayer(layer.id, { text: textRef.innerText });
		}
	}

	function onTextKey(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			(e.currentTarget as HTMLElement).blur();
		}
	}

	const font = $derived(layer.type === 'text' ? fontById((layer as TextLayer).font) : null);
	const textStyles = $derived.by(() => {
		if (layer.type !== 'text') return '';
		const t = layer as TextLayer;
		const f = font!;
		const parts: string[] = [
			`font-family: '${f.family}', sans-serif`,
			`font-weight: ${t.weight}`,
			`font-size: ${t.size}px`,
			`color: ${t.color}`,
			`text-align: ${t.align}`,
			`line-height: 1.05`
		];
		if (t.stroke) {
			parts.push(
				`-webkit-text-stroke: ${t.stroke.width}px ${t.stroke.color}`,
				`paint-order: stroke fill`
			);
		}
		if (t.shadow) {
			parts.push(
				`text-shadow: ${t.shadow.dx}px ${t.shadow.dy}px 0 ${t.shadow.color}`
			);
		}
		return parts.join('; ');
	});
</script>

<svelte:document
	onkeydown={(e) => {
		if (editing && e.key === 'Escape') {
			textRef?.blur();
		}
	}}
/>

<div
	class="layer"
	data-id={layer.id}
	data-type={layer.type}
	data-selected={selected}
	data-editing={editing}
	style="
		--x: {layer.x}px;
		--y: {layer.y}px;
		--w: {layer.w}px;
		--h: {layer.h}px;
		--rot: {layer.rotation}rad;
		--opacity: {layer.opacity};
	"
	onclick={onClick}
	ondblclick={onDblClick}
	role="presentation"
>
	{#if layer.type === 'image'}
		{@const img = layer as ImageLayer}
		<img src={img.src} alt="" draggable={false} />
	{:else if layer.type === 'text'}
		{@const t = layer as TextLayer}
		<div
			class="text"
			class:editing
			bind:this={textRef}
			contenteditable={editing}
			role="textbox"
			tabindex="-1"
			aria-multiline="true"
			onblur={onTextBlur}
			onkeydown={onTextKey}
			style={textStyles}
		>{t.text}</div>
	{:else if layer.type === 'shape'}
		{@const s = layer as ShapeLayer}
		<svg viewBox="0 0 {s.w} {s.h}" preserveAspectRatio="none" class="shape-svg">
			<path
				d={shapePath(s.shape, s.w, s.h, s.cornerRadius ?? 0)}
				fill={s.fill}
				stroke={s.strokeColor}
				stroke-width={s.strokeWidth}
				stroke-linejoin="round"
				vector-effect="non-scaling-stroke"
			/>
		</svg>
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

	.text {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 4px;
		white-space: pre-wrap;
		word-break: break-word;
		outline: none;
		cursor: text;
		user-select: none;
	}

	.text.editing {
		cursor: text;
		user-select: text;
		background: rgba(43, 79, 255, 0.05);
	}

	.layer[data-editing='true'] {
		cursor: text;
	}

	.shape-svg {
		width: 100%;
		height: 100%;
		overflow: visible;
		pointer-events: none;
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
