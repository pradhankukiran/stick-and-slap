<script lang="ts">
	import type { Snippet } from 'svelte';

	type Color = 'paper' | 'pink' | 'yellow' | 'cobalt' | 'mint' | 'tangerine' | 'lilac' | 'ink';
	type Size = 'sm' | 'md' | 'lg';

	interface Props {
		label?: string;
		ariaLabel?: string;
		color?: Color;
		size?: Size;
		disabled?: boolean;
		active?: boolean;
		square?: boolean;
		shadowColor?: 'ink' | 'pink' | 'cobalt' | 'mint';
		onclick?: (e: MouseEvent) => void;
		children?: Snippet;
	}

	let {
		label,
		ariaLabel,
		color = 'paper',
		size = 'md',
		disabled = false,
		active = false,
		square = false,
		shadowColor = 'ink',
		onclick,
		children
	}: Props = $props();
</script>

<button
	type="button"
	class="sticky"
	data-color={color}
	data-size={size}
	data-active={active}
	data-shadow={shadowColor}
	data-square={square}
	aria-label={ariaLabel}
	{disabled}
	{onclick}
>
	{#if children}
		{@render children()}
	{:else}
		{label ?? ''}
	{/if}
</button>

<style>
	.sticky {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 10px 16px;
		font-family: var(--font-display);
		font-size: 14px;
		letter-spacing: 0.02em;
		text-transform: uppercase;
		background: var(--bg);
		color: var(--fg);
		border: var(--stroke-thick) solid var(--color-ink);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow);
		transition:
			transform 90ms var(--ease-bounce),
			box-shadow 90ms var(--ease-bounce),
			background 120ms;
	}

	.sticky:hover:not(:disabled) {
		transform: translate(-1px, -1px);
		box-shadow: var(--shadow-hover);
	}

	.sticky:active:not(:disabled),
	.sticky[data-active='true'] {
		transform: translate(3px, 3px);
		box-shadow: 1px 1px 0 var(--color-ink);
	}

	.sticky:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}

	.sticky[data-size='sm'] {
		padding: 6px 10px;
		font-size: 12px;
	}
	.sticky[data-size='lg'] {
		padding: 14px 22px;
		font-size: 18px;
	}

	.sticky[data-square='true'] {
		aspect-ratio: 1;
		padding: 0;
		width: 52px;
		height: 52px;
	}
	.sticky[data-size='sm'][data-square='true'] {
		width: 40px;
		height: 40px;
	}
	.sticky[data-size='lg'][data-square='true'] {
		width: 64px;
		height: 64px;
	}

	.sticky[data-color='paper'] {
		--bg: var(--color-paper);
		--fg: var(--color-ink);
	}
	.sticky[data-color='pink'] {
		--bg: var(--color-pink);
		--fg: var(--color-ink);
	}
	.sticky[data-color='yellow'] {
		--bg: var(--color-yellow);
		--fg: var(--color-ink);
	}
	.sticky[data-color='cobalt'] {
		--bg: var(--color-cobalt);
		--fg: var(--color-paper);
	}
	.sticky[data-color='mint'] {
		--bg: var(--color-mint);
		--fg: var(--color-ink);
	}
	.sticky[data-color='tangerine'] {
		--bg: var(--color-tangerine);
		--fg: var(--color-ink);
	}
	.sticky[data-color='lilac'] {
		--bg: var(--color-lilac);
		--fg: var(--color-ink);
	}
	.sticky[data-color='ink'] {
		--bg: var(--color-ink);
		--fg: var(--color-paper);
	}

	.sticky[data-shadow='ink'] {
		--shadow: var(--shadow-md);
		--shadow-hover: var(--shadow-lg);
	}
	.sticky[data-shadow='pink'] {
		--shadow: var(--shadow-pink);
		--shadow-hover: 6px 6px 0 var(--color-pink);
	}
	.sticky[data-shadow='cobalt'] {
		--shadow: var(--shadow-cobalt);
		--shadow-hover: 6px 6px 0 var(--color-cobalt);
	}
	.sticky[data-shadow='mint'] {
		--shadow: var(--shadow-mint);
		--shadow-hover: 6px 6px 0 var(--color-mint);
	}

	.sticky:focus-visible {
		outline: none;
		box-shadow:
			0 0 0 2px var(--color-paper),
			0 0 0 5px var(--color-ink),
			var(--shadow);
	}

	@media (prefers-reduced-motion: reduce) {
		.sticky {
			transition: none;
		}
	}
</style>
