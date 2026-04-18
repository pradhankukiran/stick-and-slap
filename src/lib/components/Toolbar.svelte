<script lang="ts">
	import { scene, makeId, type ImageLayer, type ShapeLayer, type ShapeKind, type TextLayer } from '$lib/state/scene.svelte';
	import { selection } from '$lib/state/selection.svelte';
	import { history } from '$lib/state/history.svelte';
	import { ui } from '$lib/state/ui.svelte';
	import StickyButton from './StickyButton.svelte';

	let fileInput: HTMLInputElement;

	function cascadeOffset() {
		const n = scene.layers.length;
		const dx = (n % 6) * 24;
		const dy = Math.floor(n / 6) * 24 * -1;
		return { dx, dy };
	}

	function addText() {
		const w = 400;
		const h = 140;
		const { dx, dy } = cascadeOffset();
		const layer: TextLayer = {
			id: makeId('T'),
			type: 'text',
			text: 'SLAP',
			font: 'display',
			weight: 400,
			size: 96,
			color: '#0A0A0A',
			align: 'center',
			stroke: { color: '#FAFF00', width: 6 },
			x: (scene.width - w) / 2 + dx,
			y: (scene.height - h) / 2 + dy,
			w,
			h,
			rotation: 0,
			opacity: 1,
			locked: false,
			hidden: false
		};
		history.commit();
		scene.addLayer(layer);
		selection.select(layer.id);
	}

	function addShape(kind: ShapeKind) {
		const w = kind === 'circle' || kind === 'star' ? 320 : 360;
		const h = kind === 'arrow' ? 120 : 240;
		const fills: Record<ShapeKind, string> = {
			rect: '#FF4FA3',
			circle: '#FAFF00',
			speech: '#FDFCF7',
			star: '#FAFF00',
			arrow: '#2B4FFF'
		};
		const { dx, dy } = cascadeOffset();
		const layer: ShapeLayer = {
			id: makeId('S'),
			type: 'shape',
			shape: kind,
			fill: fills[kind],
			strokeColor: '#0A0A0A',
			strokeWidth: 6,
			cornerRadius: kind === 'rect' ? 14 : 0,
			x: (scene.width - w) / 2 + dx,
			y: (scene.height - h) / 2 + dy,
			w,
			h,
			rotation: 0,
			opacity: 1,
			locked: false,
			hidden: false
		};
		history.commit();
		scene.addLayer(layer);
		selection.select(layer.id);
	}

	async function addImageFromFile(file: File) {
		if (!file.type.startsWith('image/')) return;
		const url = URL.createObjectURL(file);
		const dims = await new Promise<{ w: number; h: number }>((resolve) => {
			const img = new Image();
			img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
			img.onerror = () => resolve({ w: 800, h: 800 });
			img.src = url;
		});
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
		history.commit();
		scene.addLayer(layer);
		selection.select(layer.id);
	}

	function onFileChange(e: Event) {
		const f = (e.target as HTMLInputElement).files?.[0];
		if (f) {
			if (!f.type.startsWith('image/')) {
				alert('Please select an image file');
			} else {
				addImageFromFile(f);
			}
		}
		(e.target as HTMLInputElement).value = '';
	}
</script>

<div class="toolbar">
	<div class="group">
		<StickyButton color="paper" size="md" square onclick={() => fileInput.click()}>
			{#snippet children()}<span class="icon" title="Image">🖼</span>{/snippet}
		</StickyButton>
		<input
			bind:this={fileInput}
			type="file"
			accept="image/*"
			hidden
			onchange={onFileChange}
		/>

		<StickyButton color="yellow" size="md" square onclick={addText}>
			{#snippet children()}<span class="letter">T</span>{/snippet}
		</StickyButton>

		<StickyButton color="pink" size="md" square onclick={() => addShape('rect')}>
			{#snippet children()}<span class="letter">▢</span>{/snippet}
		</StickyButton>

		<StickyButton color="cobalt" size="md" square onclick={() => addShape('circle')}>
			{#snippet children()}<span class="letter">◯</span>{/snippet}
		</StickyButton>

		<StickyButton color="mint" size="md" square onclick={() => addShape('speech')}>
			{#snippet children()}<span class="letter">💬</span>{/snippet}
		</StickyButton>

		<StickyButton color="tangerine" size="md" square onclick={() => addShape('star')}>
			{#snippet children()}<span class="letter">★</span>{/snippet}
		</StickyButton>

		<StickyButton color="lilac" size="md" square onclick={() => addShape('arrow')}>
			{#snippet children()}<span class="letter">→</span>{/snippet}
		</StickyButton>
	</div>

	<div class="divider"></div>

	<div class="group small">
		<StickyButton
			color="paper"
			size="sm"
			square
			disabled={!history.canUndo}
			onclick={() => history.undo()}
		>
			{#snippet children()}<span class="letter">↶</span>{/snippet}
		</StickyButton>
		<StickyButton
			color="paper"
			size="sm"
			square
			disabled={!history.canRedo}
			onclick={() => history.redo()}
		>
			{#snippet children()}<span class="letter">↷</span>{/snippet}
		</StickyButton>
		<StickyButton
			color={ui.snapEnabled ? 'mint' : 'paper'}
			size="sm"
			square
			onclick={() => ui.toggleSnap()}
		>
			{#snippet children()}<span class="snap">SNAP</span>{/snippet}
		</StickyButton>
	</div>
</div>

<style>
	.toolbar {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 10px 8px;
		background: var(--color-paper);
		border: 3px solid var(--color-ink);
		border-radius: var(--radius-lg);
		box-shadow: 4px 4px 0 var(--color-ink);
	}

	.group {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.group.small {
		gap: 6px;
	}

	.divider {
		height: 2px;
		background: var(--color-ink);
		margin: 2px 0;
		opacity: 0.3;
	}

	.icon {
		font-size: 22px;
	}

	.letter {
		font-family: var(--font-display);
		font-size: 22px;
		line-height: 1;
	}

	.snap {
		font-family: var(--font-data);
		font-size: 9px;
		letter-spacing: 0.1em;
	}
</style>
