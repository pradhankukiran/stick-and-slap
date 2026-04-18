<script lang="ts">
	import { scene, makeId, type ImageLayer, type TextLayer, type ShapeLayer, type ShapeKind } from '$lib/state/scene.svelte';
	import { selection } from '$lib/state/selection.svelte';
	import { ui } from '$lib/state/ui.svelte';
	import LayerView from './LayerView.svelte';
	import TransformBox from './TransformBox.svelte';
	import { layerBBox, bboxIntersects } from '$lib/geom/bbox';
	import { onMount } from 'svelte';

	let stageEl: HTMLDivElement;
	let canvasEl: HTMLDivElement;
	let dragging = $state(false);
	let containerWidth = $state(0);
	let containerHeight = $state(0);

	const fitScale = $derived.by(() => {
		if (containerWidth === 0 || containerHeight === 0) return 1;
		const sx = (containerWidth - 80) / scene.width;
		const sy = (containerHeight - 80) / scene.height;
		return Math.min(sx, sy, 1);
	});

	const scale = $derived(ui.zoom * fitScale);

	onMount(() => {
		const ro = new ResizeObserver((entries) => {
			const rect = entries[0].contentRect;
			containerWidth = rect.width;
			containerHeight = rect.height;
		});
		ro.observe(stageEl);
		return () => ro.disconnect();
	});

	async function acceptFile(file: File | null | undefined) {
		if (!file) return;
		if (!file.type.startsWith('image/')) return;
		const url = URL.createObjectURL(file);
		const dims = await loadImageDims(url);
		const aspect = dims.w / dims.h;
		const maxW = scene.width * 0.7;
		const maxH = scene.height * 0.7;
		let w = maxW;
		let h = w / aspect;
		if (h > maxH) {
			h = maxH;
			w = h * aspect;
		}
		const layer: ImageLayer = {
			id: makeId('I'),
			type: 'image',
			src: url,
			x: (scene.width - w) / 2,
			y: (scene.height - h) / 2,
			w,
			h,
			rotation: 0,
			opacity: 1,
			locked: false,
			hidden: false
		};
		scene.addLayer(layer);
		selection.select(layer.id);
	}

	function loadImageDims(url: string): Promise<{ w: number; h: number }> {
		return new Promise((resolve) => {
			const img = new Image();
			img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
			img.onerror = () => resolve({ w: 800, h: 800 });
			img.src = url;
		});
	}

	function onDragOver(e: DragEvent) {
		e.preventDefault();
		dragging = true;
	}

	function onDragLeave() {
		dragging = false;
	}

	function onDrop(e: DragEvent) {
		e.preventDefault();
		dragging = false;
		const file = e.dataTransfer?.files?.[0];
		acceptFile(file);
	}

	function onBackgroundClick(e: MouseEvent) {
		if (e.target === canvasEl) selection.clear();
	}

	// Marquee selection
	let marquee = $state<{ x: number; y: number; w: number; h: number } | null>(null);
	let marqueeStart: { x: number; y: number } | null = null;
	let marqueeAdd = false;

	function onCanvasPointerDown(e: PointerEvent) {
		if (e.target !== canvasEl) return;
		if (e.button !== 0) return;
		const rect = canvasEl.getBoundingClientRect();
		const local = { x: (e.clientX - rect.left) / scale, y: (e.clientY - rect.top) / scale };
		marqueeStart = local;
		marquee = { x: local.x, y: local.y, w: 0, h: 0 };
		marqueeAdd = e.shiftKey;
		canvasEl.setPointerCapture(e.pointerId);
		window.addEventListener('pointermove', onMarqueeMove);
		window.addEventListener('pointerup', onMarqueeUp);
	}

	function onMarqueeMove(e: PointerEvent) {
		if (!marqueeStart || !canvasEl) return;
		const rect = canvasEl.getBoundingClientRect();
		const now = { x: (e.clientX - rect.left) / scale, y: (e.clientY - rect.top) / scale };
		marquee = {
			x: Math.min(marqueeStart.x, now.x),
			y: Math.min(marqueeStart.y, now.y),
			w: Math.abs(now.x - marqueeStart.x),
			h: Math.abs(now.y - marqueeStart.y)
		};
	}

	function onMarqueeUp() {
		if (marquee && marquee.w > 2 && marquee.h > 2) {
			const hits = scene.layers
				.filter((l) => !l.hidden && !l.locked && bboxIntersects(marquee!, layerBBox(l)))
				.map((l) => l.id);
			if (marqueeAdd) selection.addRange(hits);
			else selection.setMany(hits);
		} else if (!marqueeAdd) {
			selection.clear();
		}
		marqueeStart = null;
		marquee = null;
		window.removeEventListener('pointermove', onMarqueeMove);
		window.removeEventListener('pointerup', onMarqueeUp);
	}

	export function addShapeLayer(kind: ShapeKind) {
		const w = kind === 'circle' || kind === 'star' ? 320 : 360;
		const h = kind === 'arrow' ? 120 : 240;
		const fills: Record<ShapeKind, string> = {
			rect: '#FF4FA3',
			circle: '#FAFF00',
			speech: '#FDFCF7',
			star: '#FAFF00',
			arrow: '#2B4FFF'
		};
		const layer: ShapeLayer = {
			id: makeId('S'),
			type: 'shape',
			shape: kind,
			fill: fills[kind],
			strokeColor: '#0A0A0A',
			strokeWidth: 6,
			cornerRadius: kind === 'rect' ? 14 : 0,
			x: (scene.width - w) / 2,
			y: (scene.height - h) / 2,
			w,
			h,
			rotation: 0,
			opacity: 1,
			locked: false,
			hidden: false
		};
		scene.addLayer(layer);
		selection.select(layer.id);
		return layer;
	}

	export function addTextLayer(text = 'SLAP') {
		const w = 400;
		const h = 140;
		const layer: TextLayer = {
			id: makeId('T'),
			type: 'text',
			text,
			font: 'display',
			weight: 400,
			size: 96,
			color: '#0A0A0A',
			align: 'center',
			stroke: { color: '#FAFF00', width: 6 },
			x: (scene.width - w) / 2,
			y: (scene.height - h) / 2,
			w,
			h,
			rotation: 0,
			opacity: 1,
			locked: false,
			hidden: false
		};
		scene.addLayer(layer);
		selection.select(layer.id);
		return layer;
	}

	function isTypingInEditable(): boolean {
		const el = document.activeElement as HTMLElement | null;
		if (!el) return false;
		const tag = el.tagName;
		return (
			tag === 'INPUT' ||
			tag === 'TEXTAREA' ||
			tag === 'SELECT' ||
			el.isContentEditable
		);
	}

	function onDocKey(e: KeyboardEvent) {
		if (isTypingInEditable()) return;
		const key = e.key.toLowerCase();
		if (key === 't') {
			e.preventDefault();
			addTextLayer();
		} else if (key === 'r') {
			e.preventDefault();
			addShapeLayer('rect');
		} else if (key === 'c') {
			e.preventDefault();
			addShapeLayer('circle');
		} else if (key === 'b') {
			e.preventDefault();
			addShapeLayer('speech');
		} else if (key === 'x') {
			e.preventDefault();
			addShapeLayer('star');
		} else if (key === 'a') {
			e.preventDefault();
			addShapeLayer('arrow');
		} else if (key === 'delete' || key === 'backspace') {
			if (selection.ids.length > 0) {
				e.preventDefault();
				for (const id of [...selection.ids]) scene.removeLayer(id);
				selection.clear();
			}
		} else if (key === 'escape') {
			selection.clear();
		} else if (key === 'arrowleft' || key === 'arrowright' || key === 'arrowup' || key === 'arrowdown') {
			if (selection.ids.length === 0) return;
			e.preventDefault();
			const step = e.shiftKey ? 10 : 1;
			const dx = key === 'arrowleft' ? -step : key === 'arrowright' ? step : 0;
			const dy = key === 'arrowup' ? -step : key === 'arrowdown' ? step : 0;
			for (const id of selection.ids) scene.moveLayer(id, { dx, dy });
		}
	}
</script>

<svelte:document onkeydown={onDocKey} />

<div
	class="stage-wrap"
	bind:this={stageEl}
	ondrop={onDrop}
	ondragover={onDragOver}
	ondragleave={onDragLeave}
	data-dragging={dragging}
	role="application"
>
	<div
		class="canvas"
		bind:this={canvasEl}
		style="--w: {scene.width}px; --h: {scene.height}px; --scale: {scale}; --bg: {scene.background}"
		onclick={onBackgroundClick}
		onpointerdown={onCanvasPointerDown}
		role="presentation"
	>
		{#each scene.layers as layer (layer.id)}
			{#if !layer.hidden}
				<LayerView {layer} />
			{/if}
		{/each}

		{#if !selection.isEmpty}
			<TransformBox {scale} />
		{/if}

		{#if marquee}
			<div
				class="marquee"
				style="--x: {marquee.x}px; --y: {marquee.y}px; --w: {marquee.w}px; --h: {marquee.h}px; --cs: {1 / scale};"
				aria-hidden="true"
			></div>
		{/if}
	</div>

	{#if dragging}
		<div class="drop-overlay">
			<div class="drop-msg">
				<span class="drop-title">drop to slap</span>
				<span class="drop-sub">we'll put it on the canvas</span>
			</div>
		</div>
	{/if}

	{#if scene.layers.length === 0 && !dragging}
		<div class="empty" aria-hidden="true">
			<span class="empty-title">drop a pic</span>
			<span class="empty-sub">or press T to type, R for rect, S for sticker</span>
		</div>
	{/if}

	<div class="hud" aria-hidden="true">
		<span>{scene.width} × {scene.height}</span>
		<span class="dot"></span>
		<span>{Math.round(scale * 100)}%</span>
	</div>
</div>

<style>
	.stage-wrap {
		position: relative;
		width: 100%;
		height: 100%;
		min-height: 520px;
		display: grid;
		place-items: center;
		overflow: hidden;
	}

	.canvas {
		position: relative;
		width: var(--w);
		height: var(--h);
		background: var(--bg);
		border: 3px solid var(--color-ink);
		border-radius: 4px;
		box-shadow: 6px 6px 0 var(--color-ink);
		transform: scale(var(--scale));
		transform-origin: center center;
		user-select: none;
	}

	[data-dragging='true'] .canvas {
		box-shadow: 0 0 0 4px var(--color-cobalt), 6px 6px 0 var(--color-ink);
	}

	.drop-overlay {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		pointer-events: none;
		background: repeating-linear-gradient(
			45deg,
			rgba(43, 79, 255, 0.05) 0 20px,
			rgba(43, 79, 255, 0.12) 20px 40px
		);
	}

	.drop-msg {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		padding: 20px 32px;
		background: var(--color-yellow);
		border: 3px solid var(--color-ink);
		box-shadow: 4px 4px 0 var(--color-ink);
		transform: rotate(-2deg);
	}

	.drop-title {
		font-family: var(--font-display);
		font-size: 28px;
	}

	.drop-sub {
		font-family: var(--font-hand);
		font-size: 18px;
	}

	.empty {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 4px;
		pointer-events: none;
	}

	.empty-title {
		font-family: var(--font-display);
		font-size: clamp(32px, 6vw, 56px);
		color: var(--color-ink-soft);
		transform: rotate(-2deg);
	}

	.empty-sub {
		font-family: var(--font-hand);
		font-size: clamp(16px, 2vw, 22px);
		color: var(--color-pink);
	}

	.marquee {
		position: absolute;
		left: 0;
		top: 0;
		width: var(--w);
		height: var(--h);
		transform: translate(var(--x), var(--y));
		background: rgba(43, 79, 255, 0.08);
		border: calc(2px * var(--cs)) dashed var(--color-cobalt);
		pointer-events: none;
		z-index: 60;
	}

	.hud {
		position: absolute;
		bottom: 10px;
		right: 12px;
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 4px 10px;
		background: var(--color-ink);
		color: var(--color-paper);
		font-family: var(--font-data);
		font-size: 10px;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		border-radius: 999px;
		pointer-events: none;
	}

	.dot {
		width: 4px;
		height: 4px;
		border-radius: 50%;
		background: var(--color-pink);
	}
</style>
