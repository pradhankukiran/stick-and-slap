import type { LayerBase } from '$lib/state/scene.svelte';

export interface BBox {
	x: number;
	y: number;
	w: number;
	h: number;
}

export interface Point {
	x: number;
	y: number;
}

export function center(b: { x: number; y: number; w: number; h: number }): Point {
	return { x: b.x + b.w / 2, y: b.y + b.h / 2 };
}

/** Corner order: TL, TR, BR, BL. */
export function rotatedCorners(l: Pick<LayerBase, 'x' | 'y' | 'w' | 'h' | 'rotation'>): Point[] {
	const cx = l.x + l.w / 2;
	const cy = l.y + l.h / 2;
	const cos = Math.cos(l.rotation);
	const sin = Math.sin(l.rotation);
	const halfW = l.w / 2;
	const halfH = l.h / 2;
	const local: Point[] = [
		{ x: -halfW, y: -halfH },
		{ x: halfW, y: -halfH },
		{ x: halfW, y: halfH },
		{ x: -halfW, y: halfH }
	];
	return local.map((p) => ({
		x: cx + p.x * cos - p.y * sin,
		y: cy + p.x * sin + p.y * cos
	}));
}

export function axisAlignedBBox(points: Point[]): BBox {
	if (points.length === 0) return { x: 0, y: 0, w: 0, h: 0 };
	let minX = Infinity;
	let minY = Infinity;
	let maxX = -Infinity;
	let maxY = -Infinity;
	for (const p of points) {
		if (p.x < minX) minX = p.x;
		if (p.y < minY) minY = p.y;
		if (p.x > maxX) maxX = p.x;
		if (p.y > maxY) maxY = p.y;
	}
	return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

export function layerBBox(l: Pick<LayerBase, 'x' | 'y' | 'w' | 'h' | 'rotation'>): BBox {
	return axisAlignedBBox(rotatedCorners(l));
}

export function unionBBox(boxes: BBox[]): BBox | null {
	if (boxes.length === 0) return null;
	let minX = Infinity;
	let minY = Infinity;
	let maxX = -Infinity;
	let maxY = -Infinity;
	for (const b of boxes) {
		if (b.x < minX) minX = b.x;
		if (b.y < minY) minY = b.y;
		if (b.x + b.w > maxX) maxX = b.x + b.w;
		if (b.y + b.h > maxY) maxY = b.y + b.h;
	}
	return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

export function pointInBBox(p: Point, b: BBox): boolean {
	return p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h;
}

export function bboxIntersects(a: BBox, b: BBox): boolean {
	return !(a.x + a.w < b.x || b.x + b.w < a.x || a.y + a.h < b.y || b.y + b.h < a.y);
}
