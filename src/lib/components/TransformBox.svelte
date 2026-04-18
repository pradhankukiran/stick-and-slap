<script lang="ts">
	import { scene, type Layer } from '$lib/state/scene.svelte';
	import { selection } from '$lib/state/selection.svelte';
	import { history } from '$lib/state/history.svelte';
	import { ui } from '$lib/state/ui.svelte';
	import { draggable, type DragInfo } from '$lib/actions/draggable';
	import { applyHandleDrag, applyRotation, angleTo, type HandleName } from '$lib/geom/transform';
	import { layerBBox, rotatedCorners, unionBBox } from '$lib/geom/bbox';
	import { snapBBox } from '$lib/geom/snap';

	interface Props {
		scale: number;
	}

	let { scale }: Props = $props();

	const counterScale = $derived(1 / scale);

	// For a single selected layer, the transform box is the layer's rotated rect.
	// For multi-select, it's the axis-aligned union bbox (no rotation).
	const single = $derived(selection.isSingle ? selection.primary : null);
	const multiBox = $derived(selection.isSingle ? null : selection.groupBBox);

	// Snapshot taken on drag start for math
	let dragStart: { layers: Array<{ layer: Layer; snapshot: Layer }>; pointer: { x: number; y: number }; rect: { x: number; y: number; w: number; h: number; rotation: number } } | null = null;

	function screenToCanvas(clientX: number, clientY: number, canvasRect: DOMRect): { x: number; y: number } {
		return {
			x: (clientX - canvasRect.left) / scale,
			y: (clientY - canvasRect.top) / scale
		};
	}

	function getCanvasRect(node: HTMLElement): DOMRect | null {
		const canvas = node.closest('.canvas') as HTMLElement | null;
		return canvas?.getBoundingClientRect() ?? null;
	}

	function startHandle(handle: HandleName) {
		return {
			onstart: (info: DragInfo) => {
				const layer = single;
				if (!layer) return;
				history.commit();
				dragStart = {
					layers: [{ layer, snapshot: { ...layer } }],
					pointer: { x: info.x, y: info.y },
					rect: { x: layer.x, y: layer.y, w: layer.w, h: layer.h, rotation: layer.rotation }
				};
			},
			ondrag: (info: DragInfo) => {
				if (!dragStart || !single) return;
				const canvasEl = document.querySelector('.canvas') as HTMLElement | null;
				if (!canvasEl) return;
				const rect = canvasEl.getBoundingClientRect();
				const pointer = screenToCanvas(info.x, info.y, rect);
				const next = applyHandleDrag(dragStart.rect, handle, pointer, {
					uniform: info.shiftKey,
					fromCenter: info.altKey
				});
				scene.updateLayer(single.id, {
					x: next.x,
					y: next.y,
					w: next.w,
					h: next.h
				});
			},
			onend: () => {
				dragStart = null;
				ui.activeGuides = [];
			}
		};
	}

	function moveHandlers() {
		return {
			onstart: (info: DragInfo) => {
				history.commit();
				const layers = selection.layers.map((l) => ({ layer: l, snapshot: { ...l } }));
				dragStart = {
					layers,
					pointer: { x: info.x, y: info.y },
					rect: { x: 0, y: 0, w: 0, h: 0, rotation: 0 }
				};
			},
			ondrag: (info: DragInfo) => {
				if (!dragStart) return;
				const canvasEl = document.querySelector('.canvas') as HTMLElement | null;
				if (!canvasEl) return;
				const rect = canvasEl.getBoundingClientRect();
				const startLocal = screenToCanvas(dragStart.pointer.x, dragStart.pointer.y, rect);
				const nowLocal = screenToCanvas(info.x, info.y, rect);
				let dx = nowLocal.x - startLocal.x;
				let dy = nowLocal.y - startLocal.y;

				if (ui.snapEnabled && !info.altKey) {
					const selectedIds = new Set(dragStart.layers.map((l) => l.snapshot.id));
					const movingBBoxes = dragStart.layers.map((l) =>
						layerBBox({ ...l.snapshot, x: l.snapshot.x + dx, y: l.snapshot.y + dy })
					);
					const groupBBox = unionBBox(movingBBoxes);
					if (groupBBox) {
						const others = scene.layers
							.filter((l) => !selectedIds.has(l.id) && !l.hidden)
							.map((l) => layerBBox(l));
						const snap = snapBBox(groupBBox, {
							canvasW: scene.width,
							canvasH: scene.height,
							otherBBoxes: others
						});
						dx += snap.dx;
						dy += snap.dy;
						ui.activeGuides = snap.guides;
					} else {
						ui.activeGuides = [];
					}
				}

				for (const { snapshot } of dragStart.layers) {
					scene.updateLayer(snapshot.id, {
						x: snapshot.x + dx,
						y: snapshot.y + dy
					});
				}
			},
			onend: () => {
				dragStart = null;
				ui.activeGuides = [];
			}
		};
	}

	function rotateHandlers() {
		return {
			onstart: (info: DragInfo) => {
				const layer = single;
				if (!layer) return;
				const canvasEl = document.querySelector('.canvas') as HTMLElement | null;
				if (!canvasEl) return;
				history.commit();
				const rect = canvasEl.getBoundingClientRect();
				const pointer = screenToCanvas(info.x, info.y, rect);
				const centerX = layer.x + layer.w / 2;
				const centerY = layer.y + layer.h / 2;
				const startAngle = angleTo({ x: centerX, y: centerY }, pointer);
				dragStart = {
					layers: [{ layer, snapshot: { ...layer } }],
					pointer: { x: startAngle, y: 0 },
					rect: { x: layer.x, y: layer.y, w: layer.w, h: layer.h, rotation: layer.rotation }
				};
			},
			ondrag: (info: DragInfo) => {
				if (!dragStart || !single) return;
				const canvasEl = document.querySelector('.canvas') as HTMLElement | null;
				if (!canvasEl) return;
				const rect = canvasEl.getBoundingClientRect();
				const pointer = screenToCanvas(info.x, info.y, rect);
				const centerX = dragStart.rect.x + dragStart.rect.w / 2;
				const centerY = dragStart.rect.y + dragStart.rect.h / 2;
				const currentAngle = angleTo({ x: centerX, y: centerY }, pointer);
				const startAngle = dragStart.pointer.x;
				const next = applyRotation(dragStart.rect.rotation, startAngle, currentAngle, info.shiftKey);
				scene.updateLayer(single.id, { rotation: next });
			},
			onend: () => {
				dragStart = null;
				ui.activeGuides = [];
			}
		};
	}

	const HANDLES: Array<{ name: HandleName; x: number; y: number; cursor: string }> = [
		{ name: 'nw', x: 0, y: 0, cursor: 'nwse-resize' },
		{ name: 'n', x: 0.5, y: 0, cursor: 'ns-resize' },
		{ name: 'ne', x: 1, y: 0, cursor: 'nesw-resize' },
		{ name: 'e', x: 1, y: 0.5, cursor: 'ew-resize' },
		{ name: 'se', x: 1, y: 1, cursor: 'nwse-resize' },
		{ name: 's', x: 0.5, y: 1, cursor: 'ns-resize' },
		{ name: 'sw', x: 0, y: 1, cursor: 'nesw-resize' },
		{ name: 'w', x: 0, y: 0.5, cursor: 'ew-resize' }
	];
</script>

{#if single}
	{@const box = { x: single.x, y: single.y, w: single.w, h: single.h }}
	<div
		class="box single"
		style="
			--x: {box.x}px;
			--y: {box.y}px;
			--w: {box.w}px;
			--h: {box.h}px;
			--rot: {single.rotation}rad;
			--cs: {counterScale};
		"
	>
		<div class="body" use:draggable={moveHandlers()}></div>

		{#each HANDLES as h (h.name)}
			<div
				class="handle"
				style="--hx: {h.x * 100}%; --hy: {h.y * 100}%; cursor: {h.cursor};"
				use:draggable={startHandle(h.name)}
			></div>
		{/each}

		<div class="rotate-tether" style="--cs: {counterScale}"></div>
		<div class="rotate-handle" style="--cs: {counterScale}" use:draggable={rotateHandlers()}></div>
	</div>
{:else if multiBox}
	<div
		class="box multi"
		style="
			--x: {multiBox.x}px;
			--y: {multiBox.y}px;
			--w: {multiBox.w}px;
			--h: {multiBox.h}px;
			--cs: {counterScale};
		"
	>
		<div class="body" use:draggable={moveHandlers()}></div>
	</div>
{/if}

<style>
	.box {
		position: absolute;
		left: 0;
		top: 0;
		width: var(--w);
		height: var(--h);
		transform: translate(var(--x), var(--y)) rotate(var(--rot, 0));
		transform-origin: center center;
		pointer-events: none;
		outline: calc(2px * var(--cs)) dashed var(--color-cobalt);
		outline-offset: 0;
		z-index: 50;
	}

	.body {
		position: absolute;
		inset: 0;
		pointer-events: auto;
		cursor: move;
	}

	.handle {
		position: absolute;
		width: calc(14px * var(--cs));
		height: calc(14px * var(--cs));
		left: var(--hx);
		top: var(--hy);
		transform: translate(-50%, -50%);
		background: var(--color-yellow);
		border: calc(2px * var(--cs)) solid var(--color-ink);
		box-shadow: calc(2px * var(--cs)) calc(2px * var(--cs)) 0 var(--color-ink);
		border-radius: calc(2px * var(--cs));
		pointer-events: auto;
	}

	.rotate-tether {
		position: absolute;
		left: 50%;
		top: 0;
		width: calc(2px * var(--cs));
		height: calc(28px * var(--cs));
		background: var(--color-cobalt);
		transform: translate(-50%, -100%);
		pointer-events: none;
	}

	.rotate-handle {
		position: absolute;
		left: 50%;
		top: 0;
		width: calc(18px * var(--cs));
		height: calc(18px * var(--cs));
		transform: translate(-50%, calc(-100% - 20px * var(--cs)));
		background: var(--color-pink);
		border: calc(2px * var(--cs)) solid var(--color-ink);
		border-radius: 50%;
		box-shadow: calc(2px * var(--cs)) calc(2px * var(--cs)) 0 var(--color-ink);
		cursor: grab;
		pointer-events: auto;
	}

	.rotate-handle:active {
		cursor: grabbing;
	}
</style>
