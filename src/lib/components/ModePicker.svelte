<script lang="ts">
	import { scene, PRESETS, type Preset } from '$lib/state/scene.svelte';
	import { ui } from '$lib/state/ui.svelte';
	import StickyButton from './StickyButton.svelte';
	import StickyPanel from './StickyPanel.svelte';
	import Scribble from './Scribble.svelte';

	const SHADOWS = ['ink', 'pink', 'cobalt', 'mint'] as const;

	function pick(p: Preset) {
		scene.setPreset(p);
		ui.modePicked = true;
	}

	const socialPresets = $derived(PRESETS.filter((p) => p.group === 'social'));
	const freePresets = $derived(PRESETS.filter((p) => p.group === 'free'));
</script>

<div class="splash">
	<header class="header">
		<div class="tags">
			<span class="chip chip-yellow">new!</span>
			<span class="chip chip-pink">unhinged</span>
			<span class="chip chip-cobalt">100% browser</span>
		</div>
		<h1>
			<span class="wordmark">stick</span>
			<Scribble kind="squiggle" size={48} color="var(--color-pink)" rotate={-4} />
			<span class="wordmark">and</span>
			<Scribble kind="bang" size={48} color="var(--color-cobalt)" rotate={8} />
			<span class="wordmark">slap</span>
		</h1>
		<p class="tagline">
			pick a canvas. <Scribble kind="arrow" size={64} color="var(--color-ink)" /> slap stuff on it. <span class="hl">export.</span>
		</p>
	</header>

	<div class="groups">
		<StickyPanel title="SOCIAL" color="paper" peel="left" pad="lg">
			<div class="grid">
				{#each socialPresets as p, i (p.id)}
					<button type="button" class="preset" onclick={() => pick(p)}>
						<div class="preview" style="--w: {p.width}; --h: {p.height}">
							<div class="preview-inner" data-shadow={SHADOWS[i % SHADOWS.length]}></div>
						</div>
						<span class="label">{p.label}</span>
						<span class="dims">{p.width} × {p.height}</span>
					</button>
				{/each}
			</div>
		</StickyPanel>

		<StickyPanel title="FREEFORM" color="yellow" peel="right" pad="lg">
			<div class="grid">
				{#each freePresets as p, i (p.id)}
					<button type="button" class="preset" onclick={() => pick(p)}>
						<div class="preview" style="--w: {p.width}; --h: {p.height}">
							<div class="preview-inner" data-shadow={SHADOWS[(i + 2) % SHADOWS.length]}></div>
						</div>
						<span class="label">{p.label}</span>
						<span class="dims">{p.width} × {p.height}</span>
					</button>
				{/each}
			</div>
		</StickyPanel>
	</div>

	<footer class="footer">
		<StickyButton label="start blank" color="cobalt" size="lg" shadowColor="pink" onclick={() => pick(PRESETS[0])} />
	</footer>
</div>

<style>
	.splash {
		min-height: 100dvh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 36px;
		padding: 40px 20px 60px;
		background: var(--color-paper);
		background-image: radial-gradient(var(--color-ink) 1px, transparent 1.6px);
		background-size: 28px 28px;
	}

	.header {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 14px;
		text-align: center;
	}

	.tags {
		display: flex;
		gap: 8px;
	}

	.chip {
		font-family: var(--font-data);
		font-size: 11px;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		padding: 4px 10px;
		border: 2px solid var(--color-ink);
		border-radius: 999px;
		box-shadow: 2px 2px 0 var(--color-ink);
		transform: rotate(var(--rot, -2deg));
	}

	.chip-yellow {
		background: var(--color-yellow);
		--rot: -3deg;
	}
	.chip-pink {
		background: var(--color-pink);
		--rot: 2deg;
		color: var(--color-ink);
	}
	.chip-cobalt {
		background: var(--color-cobalt);
		color: var(--color-paper);
		--rot: -1deg;
	}

	h1 {
		margin: 0;
		display: flex;
		align-items: center;
		gap: 6px;
		font-weight: 400;
	}

	.wordmark {
		font-family: var(--font-display);
		font-size: clamp(40px, 9vw, 96px);
		letter-spacing: -0.03em;
		line-height: 0.95;
	}

	.tagline {
		font-family: var(--font-hand);
		font-size: clamp(20px, 2.6vw, 32px);
		color: var(--color-ink);
		display: inline-flex;
		align-items: center;
		gap: 8px;
		margin: 0;
	}

	.hl {
		background: var(--color-yellow);
		padding: 0 8px;
		box-shadow: 2px 2px 0 var(--color-ink);
		transform: rotate(-2deg);
		display: inline-block;
	}

	.groups {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 36px;
		width: min(960px, 96vw);
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 14px;
	}

	.preset {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		padding: 10px;
		background: var(--color-paper);
		border: 2px solid var(--color-ink);
		border-radius: var(--radius-md);
		cursor: pointer;
		transition:
			transform 120ms var(--ease-bounce),
			box-shadow 120ms var(--ease-bounce);
	}

	.preset:hover {
		transform: translate(-2px, -2px) rotate(-1.4deg);
		box-shadow: 4px 4px 0 var(--color-ink);
	}

	.preset:active {
		transform: translate(2px, 2px);
		box-shadow: 0 0 0 var(--color-ink);
	}

	.preview {
		width: 100%;
		height: 72px;
		display: grid;
		place-items: center;
		background: var(--color-paper-deep);
		border: 2px solid var(--color-ink);
		border-radius: 4px;
	}

	.preview-inner {
		width: auto;
		height: auto;
		max-width: 80%;
		max-height: 48px;
		aspect-ratio: calc(var(--w) / var(--h));
		background: var(--color-paper);
		border: 2px solid var(--color-ink);
	}
	.preview-inner[data-shadow='ink'] {
		box-shadow: 3px 3px 0 var(--color-ink);
	}
	.preview-inner[data-shadow='pink'] {
		box-shadow: 3px 3px 0 var(--color-pink);
	}
	.preview-inner[data-shadow='cobalt'] {
		box-shadow: 3px 3px 0 var(--color-cobalt);
	}
	.preview-inner[data-shadow='mint'] {
		box-shadow: 3px 3px 0 var(--color-mint);
	}

	.label {
		font-family: var(--font-display);
		font-size: 13px;
		letter-spacing: 0.02em;
	}

	.dims {
		font-family: var(--font-data);
		font-size: 10px;
		letter-spacing: 0.14em;
		color: var(--color-ink-soft);
	}

	.footer {
		margin-top: 8px;
	}

	@media (max-width: 720px) {
		.groups {
			grid-template-columns: 1fr;
		}
	}
</style>
