<script lang="ts">
	type Kind = 'star' | 'sparkle' | 'arrow' | 'squiggle' | 'bang' | 'heart';

	interface Props {
		kind?: Kind;
		size?: number;
		color?: string;
		rotate?: number;
	}

	let { kind = 'star', size = 32, color = 'var(--color-ink)', rotate = 0 }: Props = $props();
</script>

<span class="wrap" style="--size: {size}px; --rot: {rotate}deg; --col: {color}">
	{#if kind === 'star'}
		<svg viewBox="0 0 24 24" fill="none" stroke={color} stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
			<path d="M12 2 L14.5 9 L22 9.5 L16 14.5 L18.5 22 L12 17.5 L5.5 22 L8 14.5 L2 9.5 L9.5 9 Z" />
		</svg>
	{:else if kind === 'sparkle'}
		<svg viewBox="0 0 24 24" fill="none" stroke={color} stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
			<path d="M12 2 L13 10 L22 12 L13 14 L12 22 L11 14 L2 12 L11 10 Z" />
			<path d="M5 4 L5.6 6 L7.5 6.6 L5.6 7.2 L5 9 L4.4 7.2 L2.5 6.6 L4.4 6 Z" />
			<path d="M19 16 L19.5 17.6 L21 18 L19.5 18.4 L19 20 L18.5 18.4 L17 18 L18.5 17.6 Z" />
		</svg>
	{:else if kind === 'arrow'}
		<svg viewBox="0 0 64 32" fill="none" stroke={color} stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
			<path d="M4 20 C 14 4, 30 4, 42 14 C 46 18, 50 20, 54 20" />
			<path d="M46 14 L54 20 L44 24" />
		</svg>
	{:else if kind === 'squiggle'}
		<svg viewBox="0 0 64 16" fill="none" stroke={color} stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
			<path d="M4 8 Q 12 2, 20 8 T 36 8 T 52 8 T 60 8" />
		</svg>
	{:else if kind === 'bang'}
		<svg viewBox="0 0 24 24" fill={color} stroke={color} stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
			<path d="M12 2 L15 12 L22 12 L16 16 L18 23 L12 18 L6 23 L8 16 L2 12 L9 12 Z" />
		</svg>
	{:else if kind === 'heart'}
		<svg viewBox="0 0 24 24" fill={color} stroke="var(--color-ink)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
			<path d="M12 21 C 6 16, 2 12, 2 8 C 2 5, 4 3, 7 3 C 9 3, 11 4, 12 6 C 13 4, 15 3, 17 3 C 20 3, 22 5, 22 8 C 22 12, 18 16, 12 21 Z" />
		</svg>
	{/if}
</span>

<style>
	.wrap {
		display: inline-grid;
		place-items: center;
		width: var(--size);
		height: var(--size);
		transform: rotate(var(--rot));
		color: var(--col);
	}

	svg {
		width: 100%;
		height: 100%;
	}
</style>
