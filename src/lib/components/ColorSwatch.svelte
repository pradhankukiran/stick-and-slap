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

	function pick(c: string) {
		value = c;
		onchange?.(c);
	}
</script>

<div class="swatches" role="radiogroup" aria-label="Color">
	{#each palette as c (c)}
		<button
			type="button"
			class="swatch"
			style="--c: {c}"
			data-selected={value?.toLowerCase() === c.toLowerCase()}
			role="radio"
			aria-checked={value?.toLowerCase() === c.toLowerCase()}
			aria-label={c}
			onclick={() => pick(c)}
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
