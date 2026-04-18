import type { Point } from './bbox';

/** Rotate a point around an origin by angle (radians). */
export function rotatePoint(p: Point, origin: Point, angle: number): Point {
	const cos = Math.cos(angle);
	const sin = Math.sin(angle);
	const dx = p.x - origin.x;
	const dy = p.y - origin.y;
	return {
		x: origin.x + dx * cos - dy * sin,
		y: origin.y + dx * sin + dy * cos
	};
}

export type HandleName = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

interface Rect {
	x: number;
	y: number;
	w: number;
	h: number;
	rotation: number;
}

/**
 * Given a rect (with rotation) and a pointer movement in world coords,
 * compute the new rect after dragging the named handle to the pointer position.
 * The opposite-handle anchor stays fixed.
 *
 * Strategy: transform pointer into the rect's local (un-rotated) space,
 * compute new local extent based on which handle is being dragged, then
 * recompute world position so the opposite corner stays fixed.
 */
export function applyHandleDrag(
	initial: Rect,
	handle: HandleName,
	worldPointer: Point,
	opts: { uniform?: boolean; fromCenter?: boolean } = {}
): Rect {
	const { uniform = false, fromCenter = false } = opts;
	const cx = initial.x + initial.w / 2;
	const cy = initial.y + initial.h / 2;

	// Pointer in local (unrotated) coords, relative to rect center
	const local = rotatePoint(worldPointer, { x: cx, y: cy }, -initial.rotation);
	const lx = local.x - cx;
	const ly = local.y - cy;

	const halfW = initial.w / 2;
	const halfH = initial.h / 2;

	// Determine which edges follow the pointer (each edge is at ±halfW/halfH in local space)
	let left = -halfW;
	let right = halfW;
	let top = -halfH;
	let bottom = halfH;

	if (handle === 'w' || handle === 'nw' || handle === 'sw') left = lx;
	if (handle === 'e' || handle === 'ne' || handle === 'se') right = lx;
	if (handle === 'n' || handle === 'nw' || handle === 'ne') top = ly;
	if (handle === 's' || handle === 'sw' || handle === 'se') bottom = ly;

	// Guarantee positive size; allow flip (user crosses handle) with Math.abs
	let newW = right - left;
	let newH = bottom - top;

	// Minimum size to avoid zero/negative
	const minSize = 4;
	if (Math.abs(newW) < minSize) newW = newW < 0 ? -minSize : minSize;
	if (Math.abs(newH) < minSize) newH = newH < 0 ? -minSize : minSize;

	// Center-anchored scaling (Alt/Option): mirror the active edge around
	// the rect center so the opposite edge moves the same distance.
	if (fromCenter) {
		if (handle === 'e' || handle === 'ne' || handle === 'se') {
			right = lx;
			left = -lx;
		}
		if (handle === 'w' || handle === 'nw' || handle === 'sw') {
			left = lx;
			right = -lx;
		}
		if (handle === 's' || handle === 'se' || handle === 'sw') {
			bottom = ly;
			top = -ly;
		}
		if (handle === 'n' || handle === 'ne' || handle === 'nw') {
			top = ly;
			bottom = -ly;
		}
		newW = right - left;
		newH = bottom - top;
		if (Math.abs(newW) < minSize) newW = newW < 0 ? -minSize : minSize;
		if (Math.abs(newH) < minSize) newH = newH < 0 ? -minSize : minSize;
	}

	// Uniform scaling (Shift): match the less-dragged axis to the dominant axis,
	// so dragging a corner outward grows both dimensions together.
	if (uniform && (handle === 'nw' || handle === 'ne' || handle === 'sw' || handle === 'se')) {
		const aspect = initial.w / initial.h;
		const wDelta = Math.abs(newW) - initial.w;
		const hDelta = Math.abs(newH) - initial.h;
		if (Math.abs(wDelta) >= Math.abs(hDelta)) {
			// Width dominant — derive height from width
			const signH = Math.sign(newH) || 1;
			newH = (signH * Math.abs(newW)) / aspect;
			if (fromCenter) {
				const halfNewH = newH / 2;
				top = -halfNewH;
				bottom = halfNewH;
			} else if (handle === 'nw' || handle === 'ne') {
				top = bottom - newH;
			} else {
				bottom = top + newH;
			}
		} else {
			// Height dominant — derive width from height
			const signW = Math.sign(newW) || 1;
			newW = signW * Math.abs(newH) * aspect;
			if (fromCenter) {
				const halfNewW = newW / 2;
				left = -halfNewW;
				right = halfNewW;
			} else if (handle === 'nw' || handle === 'sw') {
				left = right - newW;
			} else {
				right = left + newW;
			}
		}
	}

	// New center in local coords is midpoint of new box
	const newLocalCx = (left + right) / 2;
	const newLocalCy = (top + bottom) / 2;

	// Transform new local center back to world
	const worldCenter = rotatePoint(
		{ x: cx + newLocalCx, y: cy + newLocalCy },
		{ x: cx, y: cy },
		initial.rotation
	);

	const finalW = Math.abs(newW);
	const finalH = Math.abs(newH);

	return {
		x: worldCenter.x - finalW / 2,
		y: worldCenter.y - finalH / 2,
		w: finalW,
		h: finalH,
		rotation: initial.rotation
	};
}

/**
 * Rotate: given initial rect, initial pointer angle, and current pointer angle,
 * compute new rotation. Optionally snap to 15° increments when snap=true.
 */
export function applyRotation(
	initialRotation: number,
	startAngle: number,
	currentAngle: number,
	snap = false
): number {
	let delta = currentAngle - startAngle;
	if (snap) {
		const step = Math.PI / 12; // 15°
		delta = Math.round(delta / step) * step;
	}
	let next = initialRotation + delta;
	// Normalize to [-PI, PI]
	while (next > Math.PI) next -= 2 * Math.PI;
	while (next < -Math.PI) next += 2 * Math.PI;
	return next;
}

/** Angle from origin to point (radians, 0 = east, rotating CCW → south positive y) */
export function angleTo(origin: Point, p: Point): number {
	return Math.atan2(p.y - origin.y, p.x - origin.x);
}
