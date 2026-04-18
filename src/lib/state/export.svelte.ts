import { scene } from './scene.svelte';
import { exportSceneAsPNG, snapshotScene } from '$lib/media/export';

export type ExportStatus = 'idle' | 'rendering' | 'done' | 'error';

class ExportState {
	status = $state<ExportStatus>('idle');
	open = $state<boolean>(false);
	blob = $state<Blob | null>(null);
	previewUrl = $state<string | null>(null);
	error = $state<string | null>(null);
	abortCtrl: AbortController | null = null;

	async run() {
		this.reset();
		this.open = true;
		this.status = 'rendering';
		const ctrl = new AbortController();
		this.abortCtrl = ctrl;
		try {
			const snap = snapshotScene(scene);
			const blob = await exportSceneAsPNG(snap, { signal: ctrl.signal });
			this.blob = blob;
			if (this.previewUrl) URL.revokeObjectURL(this.previewUrl);
			this.previewUrl = URL.createObjectURL(blob);
			this.status = 'done';
		} catch (e) {
			if ((e as Error).name === 'AbortError') {
				this.status = 'idle';
				this.open = false;
				return;
			}
			this.status = 'error';
			this.error = (e as Error).message ?? 'Export failed.';
			console.error('export failed', e);
		} finally {
			if (this.abortCtrl === ctrl) this.abortCtrl = null;
		}
	}

	cancel() {
		this.abortCtrl?.abort();
	}

	close() {
		this.open = false;
		this.reset();
	}

	reset() {
		this.status = 'idle';
		this.error = null;
		this.blob = null;
		if (this.previewUrl) {
			URL.revokeObjectURL(this.previewUrl);
			this.previewUrl = null;
		}
	}

	download() {
		if (!this.blob || !this.previewUrl) return;
		const a = document.createElement('a');
		a.href = this.previewUrl;
		a.download = `slap_${scene.presetId}_${new Date().toISOString().slice(0, 10)}.png`;
		a.click();
	}
}

export const exporter = new ExportState();
