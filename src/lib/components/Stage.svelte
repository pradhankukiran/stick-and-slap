<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		toolbar?: Snippet;
		canvas?: Snippet;
		panels?: Snippet;
	}

	let { toolbar, canvas, panels }: Props = $props();
</script>

<div class="stage">
	<header class="header">
		<div class="brand">
			<span class="wordmark">stick</span>
			<span class="tilde">·and·</span>
			<span class="wordmark">slap</span>
		</div>
		<span class="tagline">the canvas editor that slaps</span>
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
		align-items: baseline;
		justify-content: space-between;
		padding: 4px 8px;
	}

	.brand {
		display: inline-flex;
		align-items: baseline;
		gap: 4px;
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
