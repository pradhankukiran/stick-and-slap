<script lang="ts">
	import type { Snippet } from 'svelte';
	import { exporter } from '$lib/state/export.svelte';
	import { scene } from '$lib/state/scene.svelte';
	import { ui } from '$lib/state/ui.svelte';
	import StickyButton from './StickyButton.svelte';
	import Scribble from './Scribble.svelte';

	interface Props {
		toolbar?: Snippet;
		canvas?: Snippet;
		panels?: Snippet;
	}

	let { toolbar, canvas, panels }: Props = $props();

	function eject() {
		scene.reset();
		ui.modePicked = false;
	}
</script>

<div class="stage">
	<header class="header">
		<div class="brand-side">
			<div class="brand">
				<span class="wordmark">stick</span>
				<span class="tilde">·and·</span>
				<span class="wordmark">slap</span>
			</div>
			<span class="tagline">the canvas editor that slaps</span>
		</div>

		<div class="actions">
			<span class="hint">
				<kbd>T</kbd> text
				<kbd>R</kbd> rect
				<kbd>C</kbd> circle
				<kbd>B</kbd> bubble
				<kbd>X</kbd> star
				<kbd>A</kbd> arrow
				<kbd>⌫</kbd> delete
			</span>
			<StickyButton label="new canvas" color="paper" size="sm" onclick={eject} />
			<StickyButton
				color="yellow"
				size="lg"
				shadowColor="pink"
				onclick={() => exporter.run()}
			>
				{#snippet children()}
					<span class="export-label">
						<Scribble kind="bang" size={18} color="var(--color-cobalt)" />
						export
					</span>
				{/snippet}
			</StickyButton>
		</div>
	</header>

	<div class="workbench">
		{#if toolbar}
			<aside class="left">
				{@render toolbar()}
			</aside>
		{/if}

		<section class="center">
			{#if canvas}
				{@render canvas()}
			{/if}
		</section>

		{#if panels}
			<aside class="right">
				{@render panels()}
			</aside>
		{/if}
	</div>
</div>

<style>
	.stage {
		min-height: 100dvh;
		display: flex;
		flex-direction: column;
		gap: 16px;
		padding: 16px;
		background: var(--color-paper);
	}

	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		flex-wrap: wrap;
		padding: 4px 8px;
	}

	.brand-side {
		display: flex;
		align-items: baseline;
		gap: 12px;
	}

	.brand {
		display: inline-flex;
		align-items: baseline;
		gap: 4px;
	}

	.actions {
		display: flex;
		align-items: center;
		gap: 10px;
		flex-wrap: wrap;
	}

	.hint {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-family: var(--font-data);
		font-size: 10px;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--color-ink-soft);
	}

	.hint kbd {
		display: inline-block;
		padding: 2px 6px;
		margin-right: 2px;
		background: var(--color-paper);
		border: 2px solid var(--color-ink);
		border-radius: 4px;
		font-family: var(--font-data);
		font-size: 10px;
		box-shadow: 1px 1px 0 var(--color-ink);
	}

	.export-label {
		display: inline-flex;
		align-items: center;
		gap: 6px;
	}

	.wordmark {
		font-family: var(--font-display);
		font-size: 28px;
		letter-spacing: -0.02em;
		color: var(--color-ink);
	}

	.tilde {
		font-family: var(--font-hand);
		font-size: 22px;
		color: var(--color-pink);
		transform: translateY(-2px) rotate(-6deg);
		display: inline-block;
	}

	.tagline {
		font-family: var(--font-hand);
		font-size: 18px;
		color: var(--color-cobalt);
		transform: rotate(-1deg);
	}

	.workbench {
		flex: 1;
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) 320px;
		gap: 18px;
		align-items: start;
		min-height: 0;
	}

	.left {
		position: sticky;
		top: 16px;
	}

	.center {
		display: grid;
		place-items: center;
		padding: 20px 0;
	}

	.right {
		position: sticky;
		top: 16px;
		display: flex;
		flex-direction: column;
		gap: 18px;
	}

	@media (max-width: 1100px) {
		.workbench {
			grid-template-columns: 1fr;
		}
		.left,
		.right {
			position: static;
		}
	}
</style>
