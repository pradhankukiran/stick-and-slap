export type LayerType = 'image' | 'text' | 'shape' | 'sticker';

export interface LayerBase {
	id: string;
	type: LayerType;
	x: number;
	y: number;
	w: number;
	h: number;
	rotation: number;
	opacity: number;
	locked: boolean;
	hidden: boolean;
}

export interface ImageLayer extends LayerBase {
	type: 'image';
	src: string;
	filter?: 'none' | 'duotone' | 'grayscale';
}

export interface TextLayer extends LayerBase {
	type: 'text';
	text: string;
	font: string;
	weight: number;
	size: number;
	color: string;
	align: 'left' | 'center' | 'right';
	stroke?: { color: string; width: number };
	shadow?: { dx: number; dy: number; color: string };
}

export type ShapeKind = 'rect' | 'circle' | 'speech' | 'star' | 'arrow';

export interface ShapeLayer extends LayerBase {
	type: 'shape';
	shape: ShapeKind;
	fill: string;
	strokeColor: string;
	strokeWidth: number;
	cornerRadius?: number;
}

export interface StickerLayer extends LayerBase {
	type: 'sticker';
	stickerId: string;
	tint?: string;
}

export type Layer = ImageLayer | TextLayer | ShapeLayer | StickerLayer;

export interface Preset {
	id: string;
	label: string;
	group: 'social' | 'free';
	width: number;
	height: number;
	background: string;
}

export const PRESETS: Preset[] = [
	{ id: 'free', label: 'Freeform', group: 'free', width: 1200, height: 1200, background: '#FDFCF7' },
	{ id: 'yt', label: 'YouTube Thumb', group: 'social', width: 1280, height: 720, background: '#FDFCF7' },
	{ id: 'ig', label: 'Instagram Post', group: 'social', width: 1080, height: 1080, background: '#FDFCF7' },
	{ id: 'story', label: 'IG / TikTok Story', group: 'social', width: 1080, height: 1920, background: '#FDFCF7' },
	{ id: 'x', label: 'X Post', group: 'social', width: 1600, height: 900, background: '#FDFCF7' },
	{ id: 'sq', label: 'Square Sticker', group: 'free', width: 800, height: 800, background: '#FDFCF7' }
];

let idCounter = 0;
export function makeId(prefix = 'L'): string {
	return `${prefix}${++idCounter}_${Math.random().toString(36).slice(2, 7)}`;
}

function revokeImageURL(layer: Layer) {
	if (layer.type === 'image' && typeof layer.src === 'string' && layer.src.startsWith('blob:')) {
		URL.revokeObjectURL(layer.src);
	}
}

function clamp(v: number, lo: number, hi: number) {
	return Math.max(lo, Math.min(v, hi));
}

class SceneState {
	width = $state(1280);
	height = $state(720);
	background = $state<string>('#FDFCF7');
	layers = $state<Layer[]>([]);
	presetId = $state<string>('yt');

	layerCount = $derived(this.layers.length);
	topLayer = $derived<Layer | null>(this.layers[this.layers.length - 1] ?? null);

	setPreset(p: Preset) {
		this.presetId = p.id;
		this.width = p.width;
		this.height = p.height;
		this.background = p.background;
	}

	reset() {
		this.disposeAll();
		this.layers = [];
	}

	disposeAll() {
		for (const l of this.layers) revokeImageURL(l);
	}

	addLayer<L extends Layer>(layer: L): L {
		this.layers = [...this.layers, layer];
		return layer;
	}

	removeLayer(id: string) {
		this.layers = this.layers.filter((l) => l.id !== id);
	}

	updateLayer(id: string, patch: Partial<LayerBase> & Partial<Record<string, unknown>>) {
		this.layers = this.layers.map((l) => (l.id === id ? ({ ...l, ...patch } as Layer) : l));
	}

	getLayer(id: string): Layer | undefined {
		return this.layers.find((l) => l.id === id);
	}

	moveLayer(id: string, delta: { dx: number; dy: number }) {
		this.layers = this.layers.map((l) =>
			l.id === id ? ({ ...l, x: l.x + delta.dx, y: l.y + delta.dy } as Layer) : l
		);
	}

	reorder(from: number, to: number) {
		if (from === to) return;
		const next = [...this.layers];
		const [item] = next.splice(from, 1);
		next.splice(clamp(to, 0, next.length), 0, item);
		this.layers = next;
	}

	bringForward(id: string) {
		const i = this.layers.findIndex((l) => l.id === id);
		if (i < 0 || i === this.layers.length - 1) return;
		this.reorder(i, i + 1);
	}

	sendBackward(id: string) {
		const i = this.layers.findIndex((l) => l.id === id);
		if (i <= 0) return;
		this.reorder(i, i - 1);
	}

	bringToFront(id: string) {
		const i = this.layers.findIndex((l) => l.id === id);
		if (i < 0) return;
		this.reorder(i, this.layers.length - 1);
	}

	sendToBack(id: string) {
		const i = this.layers.findIndex((l) => l.id === id);
		if (i < 0) return;
		this.reorder(i, 0);
	}

	duplicate(id: string): Layer | null {
		const layer = this.getLayer(id);
		if (!layer) return null;
		const copy = {
			...layer,
			id: makeId(layer.type[0].toUpperCase()),
			x: layer.x + 24,
			y: layer.y + 24
		} as Layer;
		this.layers = [...this.layers, copy];
		return copy;
	}

	snapshot(): Layer[] {
		return this.layers.map((l) => ({ ...l }));
	}

	restoreSnapshot(layers: Layer[]) {
		this.layers = layers.map((l) => ({ ...l }));
	}
}

export const scene = new SceneState();
