import { scene, type Layer } from './scene.svelte';

export interface BBox {
	x: number;
	y: number;
	w: number;
	h: number;
}

class SelectionState {
	ids = $state<string[]>([]);

	count = $derived(this.ids.length);
	isEmpty = $derived(this.ids.length === 0);
	isSingle = $derived(this.ids.length === 1);

	layers = $derived<Layer[]>(
		this.ids.map((id) => scene.getLayer(id)).filter((l): l is Layer => Boolean(l))
	);

	primaryId = $derived<string | null>(this.ids[0] ?? null);
	primary = $derived<Layer | null>(this.primaryId ? scene.getLayer(this.primaryId) ?? null : null);

	groupBBox = $derived<BBox | null>(computeBBox(this.layers));

	select(id: string) {
		this.ids = [id];
	}

	toggle(id: string) {
		this.ids = this.ids.includes(id) ? this.ids.filter((x) => x !== id) : [...this.ids, id];
	}

	addRange(ids: string[]) {
		const set = new Set(this.ids);
		for (const id of ids) set.add(id);
		this.ids = [...set];
	}

	setMany(ids: string[]) {
		this.ids = [...ids];
	}

	clear() {
		this.ids = [];
	}

	has(id: string): boolean {
		return this.ids.includes(id);
	}

	selectAll() {
		this.ids = scene.layers.filter((l) => !l.locked && !l.hidden).map((l) => l.id);
	}
}

function computeBBox(layers: Layer[]): BBox | null {
	if (layers.length === 0) return null;
	let minX = Infinity;
	let minY = Infinity;
	let maxX = -Infinity;
	let maxY = -Infinity;
	for (const l of layers) {
		const corners = rotatedCorners(l);
		for (const [cx, cy] of corners) {
			if (cx < minX) minX = cx;
			if (cy < minY) minY = cy;
			if (cx > maxX) maxX = cx;
			if (cy > maxY) maxY = cy;
		}
	}
	return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

function rotatedCorners(l: Layer): Array<[number, number]> {
	const cx = l.x + l.w / 2;
	const cy = l.y + l.h / 2;
	const cos = Math.cos(l.rotation);
	const sin = Math.sin(l.rotation);
	const halfW = l.w / 2;
	const halfH = l.h / 2;
	const local: Array<[number, number]> = [
		[-halfW, -halfH],
		[halfW, -halfH],
		[halfW, halfH],
		[-halfW, halfH]
	];
	return local.map(([lx, ly]) => [cx + lx * cos - ly * sin, cy + lx * sin + ly * cos]);
}

export const selection = new SelectionState();
