<script lang="ts">
	import type { Snippet } from 'svelte';

	type Color = 'paper' | 'pink' | 'yellow' | 'cobalt' | 'mint' | 'tangerine' | 'lilac';
	type Peel = 'none' | 'left' | 'right' | 'more-left' | 'more-right';

	interface Props {
		title?: string;
		color?: Color;
		peel?: Peel;
		shadow?: 'sm' | 'md' | 'lg' | 'xl';
		pad?: 'sm' | 'md' | 'lg';
		children?: Snippet;
	}

	let {
		title,
		color = 'paper',
		peel = 'none',
		shadow = 'md',
		pad = 'md',
		children
	}: Props = $props();
</script>

<div class="panel" data-color={color} data-peel={peel} data-shadow={shadow} data-pad={pad}>
	{#if title}
		<div class="tag">{title}</div>
	{/if}
	{#if children}
		{@render children()}
	{/if}
</div>

<style>
	.panel {
		position: relative;
		background: var(--bg);
		color: var(--fg);
		border: var(--stroke-thick) solid var(--color-ink);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-md);
	}

	.panel[data-shadow='sm'] {
		box-shadow: var(--shadow-sm);
	}
	.panel[data-shadow='lg'] {
		box-shadow: var(--shadow-lg);
	}
	.panel[data-shadow='xl'] {
		box-shadow: var(--shadow-xl);
	}

	.panel[data-pad='sm'] {
		padding: 10px;
	}
	.panel[data-pad='md'] {
		padding: 16px;
	}
	.panel[data-pad='lg'] {
		padding: 22px;
	}

	.panel[data-color='paper'] {
		--bg: var(--color-paper);
		--fg: var(--color-ink);
	}
	.panel[data-color='pink'] {
		--bg: var(--color-pink);
		--fg: var(--color-ink);
	}
	.panel[data-color='yellow'] {
		--bg: var(--color-yellow);
		--fg: var(--color-ink);
	}
	.panel[data-color='cobalt'] {
		--bg: var(--color-cobalt);
		--fg: var(--color-paper);
	}
	.panel[data-color='mint'] {
		--bg: var(--color-mint);
		--fg: var(--color-ink);
	}
	.panel[data-color='tangerine'] {
		--bg: var(--color-tangerine);
		--fg: var(--color-ink);
	}
	.panel[data-color='lilac'] {
		--bg: var(--color-lilac);
		--fg: var(--color-ink);
	}

	.panel[data-peel='left'] {
		transform: rotate(-1.4deg);
	}
	.panel[data-peel='right'] {
		transform: rotate(1.2deg);
	}
	.panel[data-peel='more-left'] {
		transform: rotate(-3deg);
	}
	.panel[data-peel='more-right'] {
		transform: rotate(2.6deg);
	}

	.tag {
		position: absolute;
		top: -14px;
		left: 14px;
		padding: 2px 10px;
		background: var(--color-ink);
		color: var(--color-paper);
		font-family: var(--font-data);
		font-size: 10px;
		letter-spacing: 0.24em;
		text-transform: uppercase;
		border-radius: var(--radius-sm);
		border: 2px solid var(--color-ink);
	}
</style>
