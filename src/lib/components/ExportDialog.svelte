<script lang="ts">
	import { exporter } from '$lib/state/export.svelte';
	import { fade, scale } from 'svelte/transition';
	import StickyButton from './StickyButton.svelte';
	import StickyPanel from './StickyPanel.svelte';
	import Scribble from './Scribble.svelte';

	function dismiss() {
		exporter.close();
	}

	function onBackdropClick() {
		if (exporter.status === 'rendering') return;
		dismiss();
	}
</script>

{#if exporter.open}
	<div
		class="backdrop"
		transition:fade={{ duration: 160 }}
		onclick={onBackdropClick}
		role="presentation"
	>
		<div
			class="panel-wrap"
			transition:scale={{ duration: 220, start: 0.92 }}
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
			role="dialog"
			tabindex="-1"
			aria-modal="true"
			aria-labelledby="export-title"
		>
			<StickyPanel color="paper" pad="lg" shadow="xl">
				<header class="header">
					<h2 id="export-title">
						<span>export</span>
						<Scribble kind="sparkle" size={36} color="var(--color-pink)" rotate={-10} />
					</h2>
					<p class="tag">png · client-side · no upload</p>
				</header>

				<div class="body">
					{#if exporter.status === 'rendering'}
						<div class="state rendering">
							<span class="spinner"></span>
							<span>rendering…</span>
						</div>
					{:else if exporter.status === 'error'}
						<div class="state error">
							<span class="bang">!</span>
							<span>{exporter.error}</span>
						</div>
					{:else if exporter.status === 'done' && exporter.previewUrl}
						<div class="preview">
							<img src={exporter.previewUrl} alt="export preview" />
						</div>
					{/if}
				</div>

				<footer class="actions">
					{#if exporter.status === 'done'}
						<StickyButton
							label="download png"
							color="cobalt"
							size="lg"
							shadowColor="pink"
							onclick={() => exporter.download()}
						/>
						<StickyButton label="close" color="paper" onclick={dismiss} />
					{:else if exporter.status === 'error'}
						<StickyButton
							label="try again"
							color="tangerine"
							onclick={() => exporter.run()}
						/>
						<StickyButton label="close" color="paper" onclick={dismiss} />
					{:else}
						<StickyButton label="cancel" color="paper" onclick={dismiss} />
					{/if}
				</footer>
			</StickyPanel>
		</div>
	</div>
{/if}

<svelte:window
	onkeydown={(e) => {
		if (exporter.open && e.key === 'Escape' && exporter.status !== 'rendering') {
			dismiss();
		}
	}}
/>

<style>
	.backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.55);
		backdrop-filter: blur(4px);
		display: grid;
		place-items: center;
		z-index: 100;
		padding: 20px;
	}

	.panel-wrap {
		width: min(560px, 92vw);
	}

	.header {
		display: flex;
		flex-direction: column;
		gap: 2px;
		margin-bottom: 16px;
	}

	h2 {
		margin: 0;
		display: inline-flex;
		align-items: center;
		gap: 8px;
		font-family: var(--font-display);
		font-size: 36px;
		letter-spacing: -0.02em;
		text-transform: lowercase;
	}

	.tag {
		margin: 0;
		font-family: var(--font-data);
		font-size: 10px;
		letter-spacing: 0.28em;
		text-transform: uppercase;
		color: var(--color-ink-soft);
	}

	.body {
		min-height: 180px;
		display: grid;
		place-items: center;
		background: var(--color-paper-deep);
		border: 2px dashed var(--color-ink);
		border-radius: var(--radius-md);
		padding: 12px;
		margin-bottom: 16px;
	}

	.state {
		display: flex;
		align-items: center;
		gap: 10px;
		font-family: var(--font-data);
		font-size: 12px;
		letter-spacing: 0.18em;
		text-transform: uppercase;
	}

	.spinner {
		width: 18px;
		height: 18px;
		border: 3px solid var(--color-ink);
		border-top-color: var(--color-pink);
		border-radius: 50%;
		animation: spin 700ms linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.error .bang {
		display: inline-grid;
		place-items: center;
		width: 28px;
		height: 28px;
		background: var(--color-pink);
		color: var(--color-ink);
		border: 2px solid var(--color-ink);
		border-radius: 50%;
		font-family: var(--font-display);
	}

	.preview {
		width: 100%;
		display: grid;
		place-items: center;
	}

	.preview img {
		max-width: 100%;
		max-height: 360px;
		object-fit: contain;
		border: 2px solid var(--color-ink);
		border-radius: 4px;
		background: #fff;
		box-shadow: 3px 3px 0 var(--color-ink);
	}

	.actions {
		display: flex;
		justify-content: flex-end;
		flex-wrap: wrap;
		gap: 10px;
	}

	@media (prefers-reduced-motion: reduce) {
		.spinner {
			animation: none;
		}
	}
</style>
