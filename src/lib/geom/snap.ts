import type { BBox } from './bbox';

export interface SnapGuide {
	orientation: 'v' | 'h';
	position: number; // canvas coord (x for vertical, y for horizontal)
}

export interface SnapResult {
	dx: number;
	dy: number;
	guides: SnapGuide[];
}

const DEFAULT_THRESHOLD = 6;

export interface SnapContext {
	canvasW: number;
	canvasH: number;
	otherBBoxes: BBox[];
	threshold?: number;
}

/**
 * Given a bounding box and context (canvas size + other layer bboxes),
 * compute the smallest (dx, dy) that snaps any of the box's left/center/right or
 * top/middle/bottom lines to a candidate. Returns the deltas and the guides to draw.
 */
export function snapBBox(box: BBox, ctx: SnapContext): SnapResult {
	const threshold = ctx.threshold ?? DEFAULT_THRESHOLD;

	const vCandidates: number[] = [0, ctx.canvasW / 2, ctx.canvasW];
	const hCandidates: number[] = [0, ctx.canvasH / 2, ctx.canvasH];
	for (const b of ctx.otherBBoxes) {
		vCandidates.push(b.x, b.x + b.w / 2, b.x + b.w);
		hCandidates.push(b.y, b.y + b.h / 2, b.y + b.h);
	}

	const boxVs = [box.x, box.x + box.w / 2, box.x + box.w];
	const boxHs = [box.y, box.y + box.h / 2, box.y + box.h];

	let bestDx = 0;
	let bestDxDist = threshold + 1;
	let bestVGuide: number | null = null;
	for (const cand of vCandidates) {
		for (const line of boxVs) {
			const d = cand - line;
			const abs = Math.abs(d);
			if (abs < bestDxDist) {
				bestDxDist = abs;
				bestDx = d;
				bestVGuide = cand;
			}
		}
	}

	let bestDy = 0;
	let bestDyDist = threshold + 1;
	let bestHGuide: number | null = null;
	for (const cand of hCandidates) {
		for (const line of boxHs) {
			const d = cand - line;
			const abs = Math.abs(d);
			if (abs < bestDyDist) {
				bestDyDist = abs;
				bestDy = d;
				bestHGuide = cand;
			}
		}
	}

	const guides: SnapGuide[] = [];
	if (bestDxDist <= threshold && bestVGuide !== null) {
		guides.push({ orientation: 'v', position: bestVGuide });
	} else {
		bestDx = 0;
	}
	if (bestDyDist <= threshold && bestHGuide !== null) {
		guides.push({ orientation: 'h', position: bestHGuide });
	} else {
		bestDy = 0;
	}

	return { dx: bestDx, dy: bestDy, guides };
}
