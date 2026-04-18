<script lang="ts">
	import { scene, type Layer, type TextLayer, type ShapeLayer, type ImageLayer } from '$lib/state/scene.svelte';
	import { selection } from '$lib/state/selection.svelte';
	import { history } from '$lib/state/history.svelte';
	import { FONTS } from '$lib/media/fonts';
	import StickyPanel from './StickyPanel.svelte';
	import ColorSwatch from './ColorSwatch.svelte';

	const primary = $derived(selection.primary);
	const type = $derived(primary?.type ?? null);

	function onSliderStart() {
		history.commit();
	}

	function update<K extends keyof Layer>(field: K, value: unknown) {
		if (!primary) return;
		scene.updateLayer(primary.id, { [field]: value });
	}

	function updateText(patch: Partial<TextLayer>) {
		if (!primary || primary.type !== 'text') return;
		scene.updateLayer(primary.id, patch);
	}

	function updateShape(patch: Partial<ShapeLayer>) {
		if (!primary || primary.type !== 'shape') return;
		scene.updateLayer(primary.id, patch);
	}

	function updateImage(patch: Partial<ImageLayer>) {
		if (!primary || primary.type !== 'image') return;
		scene.updateLayer(primary.id, patch);
	}

	function commitThen<T>(fn: () => T): T {
		history.commit();
		return fn();
	}
</script>

<StickyPanel title="INSPECTOR" color="paper" pad="md">
	{#if !primary}
		<p class="empty">select a layer<br />to tweak</p>
	{:else}
		<div class="section">
			<div class="row">
				<span class="lbl">opacity</span>
				<input
					type="range"
					min="0"
					max="1"
					step="0.01"
					value={primary.opacity}
					onpointerdown={onSliderStart}
					oninput={(e) => update('opacity', parseFloat((e.target as HTMLInputElement).value))}
				/>
				<span class="num">{Math.round(primary.opacity * 100)}%</span>
			</div>
			<div class="row">
				<span class="lbl">rotation</span>
				<input
					type="range"
					min="-3.1415"
					max="3.1415"
					step="0.01"
					value={primary.rotation}
					onpointerdown={onSliderStart}
					oninput={(e) =>
						update('rotation', parseFloat((e.target as HTMLInputElement).value))}
				/>
				<span class="num">{Math.round((primary.rotation * 180) / Math.PI)}°</span>
			</div>
		</div>

		{#if type === 'text'}
			{@const t = primary as TextLayer}
			<div class="section">
				<span class="lbl">font</span>
				<div class="font-grid">
					{#each FONTS as f (f.id)}
						<button
							type="button"
							class="font-btn"
							data-active={t.font === f.id}
							style="font-family: '{f.family}'"
							onclick={() => commitThen(() => updateText({ font: f.id }))}
						>
							{f.label}
						</button>
					{/each}
				</div>
			</div>

			<div class="section">
				<div class="row">
					<span class="lbl">size</span>
					<input
						type="range"
						min="12"
						max="240"
						step="1"
						value={t.size}
						onpointerdown={onSliderStart}
						oninput={(e) =>
							updateText({ size: parseFloat((e.target as HTMLInputElement).value) })}
					/>
					<span class="num">{t.size}</span>
				</div>
			</div>

			<div class="section">
				<span class="lbl">color</span>
				<ColorSwatch
					value={t.color}
					onchange={(c) => commitThen(() => updateText({ color: c }))}
				/>
			</div>

			<div class="section">
				<span class="lbl row-head">
					<span>outline</span>
					<input
						type="checkbox"
						checked={Boolean(t.stroke)}
						onchange={(e) => {
							const on = (e.target as HTMLInputElement).checked;
							commitThen(() =>
								updateText({ stroke: on ? { color: '#FAFF00', width: 6 } : undefined })
							);
						}}
					/>
				</span>
				{#if t.stroke}
					<ColorSwatch
						value={t.stroke.color}
						onchange={(c) => commitThen(() => updateText({ stroke: { ...t.stroke!, color: c } }))}
					/>
					<div class="row">
						<span class="lbl">width</span>
						<input
							type="range"
							min="0"
							max="20"
							step="1"
							value={t.stroke.width}
							onpointerdown={onSliderStart}
							oninput={(e) =>
								updateText({
									stroke: {
										color: t.stroke!.color,
										width: parseFloat((e.target as HTMLInputElement).value)
									}
								})}
						/>
						<span class="num">{t.stroke.width}</span>
					</div>
				{/if}
			</div>

			<div class="section">
				<span class="lbl">align</span>
				<div class="seg">
					{#each ['left', 'center', 'right'] as a (a)}
						<button
							type="button"
							class="seg-btn"
							data-active={t.align === a}
							onclick={() =>
								commitThen(() => updateText({ align: a as 'left' | 'center' | 'right' }))}
						>{a}</button>
					{/each}
				</div>
			</div>
		{:else if type === 'shape'}
			{@const s = primary as ShapeLayer}
			<div class="section">
				<span class="lbl">fill</span>
				<ColorSwatch
					value={s.fill}
					onchange={(c) => commitThen(() => updateShape({ fill: c }))}
				/>
			</div>
			<div class="section">
				<span class="lbl">stroke</span>
				<ColorSwatch
					value={s.strokeColor}
					onchange={(c) => commitThen(() => updateShape({ strokeColor: c }))}
				/>
				<div class="row">
					<span class="lbl">width</span>
					<input
						type="range"
						min="0"
						max="20"
						step="1"
						value={s.strokeWidth}
						onpointerdown={onSliderStart}
						oninput={(e) =>
							updateShape({ strokeWidth: parseFloat((e.target as HTMLInputElement).value) })}
					/>
					<span class="num">{s.strokeWidth}</span>
				</div>
			</div>
			{#if s.shape === 'rect'}
				<div class="section">
					<div class="row">
						<span class="lbl">corner</span>
						<input
							type="range"
							min="0"
							max="80"
							step="1"
							value={s.cornerRadius ?? 0}
							onpointerdown={onSliderStart}
							oninput={(e) =>
								updateShape({ cornerRadius: parseFloat((e.target as HTMLInputElement).value) })}
						/>
						<span class="num">{s.cornerRadius ?? 0}</span>
					</div>
				</div>
			{/if}
		{:else if type === 'image'}
			{@const img = primary as ImageLayer}
			<div class="section">
				<span class="lbl">filter</span>
				<div class="seg">
					{#each ['none', 'grayscale'] as f (f)}
						<button
							type="button"
							class="seg-btn"
							data-active={(img.filter ?? 'none') === f}
							onclick={() =>
								commitThen(() => updateImage({ filter: f as 'none' | 'grayscale' }))}
						>{f}</button>
					{/each}
				</div>
			</div>
		{/if}
	{/if}
</StickyPanel>

<style>
	.empty {
		font-family: var(--font-hand);
		font-size: 20px;
		color: var(--color-ink-soft);
		text-align: center;
		margin: 10px 0;
	}

	.section {
		padding: 6px 0;
		border-top: 1px dashed var(--color-ink);
	}
	.section:first-child {
		border-top: 0;
	}

	.row {
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		gap: 8px;
		padding: 4px 0;
	}

	.lbl {
		font-family: var(--font-data);
		font-size: 10px;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--color-ink-soft);
	}

	.row-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.num {
		font-family: var(--font-data);
		font-size: 11px;
		min-width: 40px;
		text-align: right;
	}

	input[type='range'] {
		accent-color: var(--color-cobalt);
	}

	.font-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 4px;
		margin-top: 4px;
	}

	.font-btn {
		padding: 6px 8px;
		background: var(--color-paper);
		border: 2px solid var(--color-ink);
		border-radius: 0;
		font-size: 14px;
		cursor: pointer;
	}

	.font-btn[data-active='true'] {
		background: var(--color-yellow);
	}

	.seg {
		display: flex;
		gap: 4px;
		margin-top: 4px;
	}

	.seg-btn {
		flex: 1;
		padding: 6px 10px;
		background: var(--color-paper);
		border: 2px solid var(--color-ink);
		border-radius: 0;
		font-family: var(--font-data);
		font-size: 10px;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		cursor: pointer;
	}

	.seg-btn[data-active='true'] {
		background: var(--color-cobalt);
		color: var(--color-paper);
	}
</style>
