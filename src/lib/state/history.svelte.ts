import { scene, type Layer } from './scene.svelte';
import { selection } from './selection.svelte';

interface Snapshot {
	layers: Layer[];
	selectedIds: string[];
}

function takeSnapshot(): Snapshot {
	return {
		layers: scene.layers.map((l) => ({ ...l })),
		selectedIds: [...selection.ids]
	};
}

function restore(snap: Snapshot) {
	scene.restoreSnapshot(snap.layers);
	selection.setMany(snap.selectedIds.filter((id) => scene.layers.some((l) => l.id === id)));
}

class HistoryState {
	past = $state<Snapshot[]>([]);
	future = $state<Snapshot[]>([]);
	maxDepth = 50;

	canUndo = $derived(this.past.length > 0);
	canRedo = $derived(this.future.length > 0);

	/** Snapshot current state and push onto past. Called BEFORE a mutation to enable undo. */
	commit() {
		this.past = [...this.past, takeSnapshot()].slice(-this.maxDepth);
		this.future = [];
	}

	undo() {
		if (this.past.length === 0) return;
		const current = takeSnapshot();
		const prev = this.past[this.past.length - 1];
		this.past = this.past.slice(0, -1);
		this.future = [current, ...this.future];
		restore(prev);
	}

	redo() {
		if (this.future.length === 0) return;
		const current = takeSnapshot();
		const next = this.future[0];
		this.future = this.future.slice(1);
		this.past = [...this.past, current];
		restore(next);
	}

	clear() {
		this.past = [];
		this.future = [];
	}
}

export const history = new HistoryState();
