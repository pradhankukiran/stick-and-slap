<script lang="ts">
	import { scene, type Layer, type TextLayer, type ShapeLayer, type StickerLayer } from '$lib/state/scene.svelte';
	import { selection } from '$lib/state/selection.svelte';
	import { history } from '$lib/state/history.svelte';
	import StickyPanel from './StickyPanel.svelte';

	function layerLabel(l: Layer): string {
		switch (l.type) {
			case 'image':
				return 'image';
			case 'text': {
				const t = l as TextLayer;
				return t.text.slice(0, 18) || 'text';
			}
			case 'shape':
				return (l as ShapeLayer).shape;
			case 'sticker':
				return `sticker · ${(l as StickerLayer).stickerId}`;
		}
	}

	function layerIcon(l: Layer): string {
		switch (l.type) {
			case 'image':
				return '🖼';
			case 'text':
				return 'T';
			case 'shape': {
				const s = l as ShapeLayer;
				if (s.shape === 'rect') return '▢';
				if (s.shape === 'circle') return '◯';
				if (s.shape === 'speech') return '💬';
				if (s.shape === 'star') return '★';
				if (s.shape === 'arrow') return '→';
				return '▢';
			}
			case 'sticker':
				return '✦';
		}
	}

	function toggleLock(id: string) {
		const layer = scene.getLayer(id);
		if (!layer) return;
		history.commit();
		scene.updateLayer(id, { locked: !layer.locked });
	}

	function toggleHidden(id: string) {
		const layer = scene.getLayer(id);
		if (!layer) return;
		history.commit();
		scene.updateLayer(id, { hidden: !layer.hidden });
	}

	function remove(id: string) {
		history.commit();
		scene.removeLayer(id);
		if (selection.has(id)) selection.remove(id);
	}

	function bumpUp(id: string, e: MouseEvent) {
		history.commit();
		if (e.shiftKey) scene.bringToFront(id);
		else scene.bringForward(id);
	}

	function bumpDown(id: string, e: MouseEvent) {
		history.commit();
		if (e.shiftKey) scene.sendToBack(id);
		else scene.sendBackward(id);
	}

	const reversed = $derived([...scene.layers].reverse());
</script>

<StickyPanel title="LAYERS" color="paper" pad="sm">
	{#if scene.layers.length === 0}
		<p class="empty">no layers yet.<br />press <kbd>T</kbd> or drop an image.</p>
	{:else}
		<ul class="list">
			{#each reversed as l (l.id)}
				{@const isSel = selection.has(l.id)}
				<li class="row" data-selected={isSel}>
					<button class="select" onclick={() => selection.select(l.id)} title={layerLabel(l)}>
						<span class="icon">{layerIcon(l)}</span>
						<span class="name" class:dim={l.hidden}>{layerLabel(l)}</span>
					</button>
					<div class="controls">
						<button
							class="icon-btn"
							onclick={(e) => bumpUp(l.id, e)}
							aria-label="Bring forward (shift: to front)"
							title="Bring forward · shift: to front"
						>
							▲
						</button>
						<button
							class="icon-btn"
							onclick={(e) => bumpDown(l.id, e)}
							aria-label="Send backward (shift: to back)"
							title="Send backward · shift: to back"
						>
							▼
						</button>
						<button
							class="icon-btn"
							data-on={!l.hidden}
							onclick={() => toggleHidden(l.id)}
							aria-label={l.hidden ? 'Show' : 'Hide'}
						>
							{l.hidden ? '○' : '●'}
						</button>
						<button
							class="icon-btn"
							data-on={l.locked}
							onclick={() => toggleLock(l.id)}
							aria-label={l.locked ? 'Unlock' : 'Lock'}
						>
							{l.locked ? '🔒' : '🔓'}
						</button>
						<button
							class="icon-btn del"
							onclick={() => remove(l.id)}
							aria-label="Delete"
						>
							✕
						</button>
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</StickyPanel>

<style>
	.empty {
		font-family: var(--font-hand);
		font-size: 18px;
		color: var(--color-ink-soft);
		margin: 0;
		padding: 10px 6px;
		text-align: center;
	}

	.empty kbd {
		display: inline-block;
		padding: 1px 5px;
		background: var(--color-yellow);
		border: 1px solid var(--color-ink);
		border-radius: 0;
		font-family: var(--font-data);
		font-size: 11px;
	}

	.list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 4px;
		max-height: 320px;
		overflow-y: auto;
	}

	.row {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;
		padding: 4px 6px;
		border-radius: 0;
		border: 2px solid transparent;
	}

	.row[data-selected='true'] {
		background: var(--color-yellow);
		border-color: var(--color-ink);
	}

	.row:hover:not([data-selected='true']) {
		background: rgba(0, 0, 0, 0.04);
	}

	.select {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		background: none;
		border: 0;
		padding: 0;
		font-family: var(--font-ui);
		font-size: 13px;
		color: inherit;
		text-align: left;
		min-width: 0;
	}

	.icon {
		display: inline-grid;
		place-items: center;
		width: 22px;
		height: 22px;
		font-size: 15px;
		background: var(--color-paper);
		border: 2px solid var(--color-ink);
		border-radius: 0;
	}

	.name {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.name.dim {
		opacity: 0.45;
		text-decoration: line-through;
	}

	.controls {
		display: inline-flex;
		gap: 2px;
	}

	.icon-btn {
		background: none;
		border: 0;
		padding: 2px 4px;
		cursor: pointer;
		font-size: 12px;
		border-radius: 0;
		opacity: 0.55;
	}

	.icon-btn:hover {
		opacity: 1;
		background: var(--color-paper);
	}

	.icon-btn[data-on='true'] {
		opacity: 1;
	}

	.icon-btn.del:hover {
		background: var(--color-pink);
	}
</style>
