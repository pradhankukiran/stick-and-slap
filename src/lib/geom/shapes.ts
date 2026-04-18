import type { ShapeKind } from '$lib/state/scene.svelte';

export function shapePath(kind: ShapeKind, w: number, h: number, cornerRadius = 0): string {
	switch (kind) {
		case 'rect': {
			const r = Math.max(0, Math.min(cornerRadius, Math.min(w, h) / 2));
			if (r === 0) return `M0 0 H${w} V${h} H0 Z`;
			return `M${r} 0 H${w - r} A${r} ${r} 0 0 1 ${w} ${r} V${h - r} A${r} ${r} 0 0 1 ${w - r} ${h} H${r} A${r} ${r} 0 0 1 0 ${h - r} V${r} A${r} ${r} 0 0 1 ${r} 0 Z`;
		}
		case 'circle': {
			const rx = w / 2;
			const ry = h / 2;
			return `M${rx} 0 A${rx} ${ry} 0 1 1 ${rx} ${h} A${rx} ${ry} 0 1 1 ${rx} 0 Z`;
		}
		case 'speech': {
			const r = Math.min(w, h) * 0.12;
			const tailStart = w * 0.25;
			const tailEnd = w * 0.42;
			const tailTip = { x: w * 0.18, y: h + Math.min(h * 0.3, 40) };
			const tailBaseY = h - r;
			return (
				`M${r} 0` +
				` H${w - r}` +
				` A${r} ${r} 0 0 1 ${w} ${r}` +
				` V${h - r}` +
				` A${r} ${r} 0 0 1 ${w - r} ${h}` +
				` H${tailEnd}` +
				` L${tailTip.x} ${tailTip.y}` +
				` L${tailStart} ${tailBaseY}` +
				` H${r}` +
				` A${r} ${r} 0 0 1 0 ${h - r}` +
				` V${r}` +
				` A${r} ${r} 0 0 1 ${r} 0` +
				` Z`
			);
		}
		case 'star': {
			const cx = w / 2;
			const cy = h / 2;
			const outer = Math.min(w, h) / 2;
			const inner = outer * 0.45;
			const points: string[] = [];
			for (let i = 0; i < 10; i++) {
				const r = i % 2 === 0 ? outer : inner;
				const angle = (-Math.PI / 2) + (i * Math.PI) / 5;
				const px = cx + r * Math.cos(angle);
				const py = cy + r * Math.sin(angle);
				points.push(`${i === 0 ? 'M' : 'L'}${px} ${py}`);
			}
			return points.join(' ') + ' Z';
		}
		case 'arrow': {
			const midY = h / 2;
			const headW = Math.min(w * 0.32, h * 1.2);
			const bodyH = h * 0.35;
			const bodyTop = midY - bodyH / 2;
			const bodyBottom = midY + bodyH / 2;
			const headBaseX = w - headW;
			return (
				`M0 ${bodyTop}` +
				` H${headBaseX}` +
				` V0` +
				` L${w} ${midY}` +
				` L${headBaseX} ${h}` +
				` V${bodyBottom}` +
				` H0` +
				` Z`
			);
		}
	}
}
