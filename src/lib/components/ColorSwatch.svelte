<script lang="ts">
	export const PALETTE = [
		'#FDFCF7',
		'#0A0A0A',
		'#FF4FA3',
		'#FAFF00',
		'#2B4FFF',
		'#00E0A4',
		'#FF6B2B',
		'#B388FF',
		'#C6FF4F',
		'#FF2B6B',
		'#FFE3EF',
		'#D9E1FF'
	];

	interface Props {
		value: string;
		onchange?: (color: string) => void;
		palette?: string[];
		allowCustom?: boolean;
	}

	let { value = $bindable(), onchange, palette = PALETTE, allowCustom = true }: Props = $props();

	let groupEl: HTMLDivElement | undefined = $state();

	function pick(c: string) {
		value = c;
		onchange?.(c);
	}

	function selectedIndex(): number {
		const lower = value?.toLowerCase() ?? '';
		const i = palette.findIndex((c) => c.toLowerCase() === lower);
		return i >= 0 ? i : 0;
	}

	function focusSwatch(i: number) {
		const btns = groupEl?.querySelectorAll<HTMLButtonElement>('button.swatch');
		if (!btns) return;
		const clamped = ((i % btns.length) + btns.length) % btns.length;
		btns[clamped]?.focus();
	}

	function onKey(e: KeyboardEvent) {
		if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
		e.preventDefault();
		const current = selectedIndex();
		const next = e.key === 'ArrowRight' ? current + 1 : current - 1;
		const wrapped = ((next % palette.length) + palette.length) % palette.length;
		pick(palette[wrapped]);
		focusSwatch(wrapped);
	}
</script>

<div class="swatches" role="radiogroup" aria-label="Color" bind:this={groupEl}>
	{#each palette as c, i (c)}
		{@const isSelected = value?.toLowerCase() === c.toLowerCase()}
		{@const selIdx = selectedIndex()}
		<button
			type="button"
			class="swatch"
			style="--c: {c}"
			data-selected={isSelected}
			role="radio"
			aria-checked={isSelected}
			aria-label={c}
			tabindex={i === selIdx ? 0 : -1}
			onclick={() => pick(c)}
			onkeydown={onKey}
		></button>
	{/each}
	{#if allowCustom}
		<label class="custom">
			<input
				type="color"
				{value}
				onchange={(e) => pick((e.target as HTMLInputElement).value)}
				aria-label="Custom color"
			/>
			<span class="custom-tag">+</span>
		</label>
	{/if}
</div>

<style>
	.swatches {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}

	.swatch,
	.custom {
		position: relative;
		width: 28px;
		height: 28px;
		background: var(--c);
		border: 2px solid var(--color-ink);
		border-radius: 6px;
		padding: 0;
		cursor: pointer;
		transition: transform 120ms var(--ease-bounce), box-shadow 120ms var(--ease-bounce);
	}

	.swatch:hover {
		transform: translate(-1px, -1px) rotate(-2deg);
		box-shadow: 2px 2px 0 var(--color-ink);
	}

	.swatch[data-selected='true'] {
		box-shadow: 0 0 0 2px var(--color-paper), 0 0 0 4px var(--color-ink);
	}

	.swatch:focus-visible,
	.custom:focus-within {
		outline: 2px solid var(--color-cobalt);
		outline-offset: 3px;
	}

	.custom {
		display: inline-grid;
		place-items: center;
		background: repeating-linear-gradient(
			45deg,
			var(--color-paper) 0 3px,
			var(--color-paper-deep) 3px 6px
		);
	}

	.custom input[type='color'] {
		position: absolute;
		inset: 0;
		opacity: 0;
		cursor: pointer;
	}

	.custom-tag {
		font-family: var(--font-display);
		font-size: 18px;
		line-height: 0;
	}
</style>
