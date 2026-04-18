import {
	type Layer,
	type ImageLayer,
	type TextLayer,
	type ShapeLayer
} from '$lib/state/scene.svelte';
import { shapePath } from '$lib/geom/shapes';
import { fontById } from './fonts';

export interface SceneSnapshot {
	width: number;
	height: number;
	background: string;
	layers: Layer[];
}

export function snapshotScene(scene: {
	width: number;
	height: number;
	background: string;
	layers: Layer[];
}): SceneSnapshot {
	return {
		width: scene.width,
		height: scene.height,
		background: scene.background,
		layers: scene.layers.map((l: Layer) => ({ ...l }))
	};
}

export async function renderSceneToCanvas(
	scene: SceneSnapshot,
	options: { scale?: number } = {}
): Promise<HTMLCanvasElement> {
	const { scale = 1 } = options;
	const canvas = document.createElement('canvas');
	canvas.width = Math.max(1, Math.round(scene.width * scale));
	canvas.height = Math.max(1, Math.round(scene.height * scale));
	const ctx = canvas.getContext('2d');
	if (!ctx) throw new Error('Could not acquire 2D context');

	ctx.scale(scale, scale);
	ctx.fillStyle = scene.background;
	ctx.fillRect(0, 0, scene.width, scene.height);

	await ensureFontsLoaded(scene.layers);

	for (const layer of scene.layers) {
		if (layer.hidden) continue;
		ctx.save();
		ctx.globalAlpha = layer.opacity;
		const cx = layer.x + layer.w / 2;
		const cy = layer.y + layer.h / 2;
		ctx.translate(cx, cy);
		ctx.rotate(layer.rotation);
		ctx.translate(-layer.w / 2, -layer.h / 2);

		if (layer.type === 'image') await paintImage(ctx, layer as ImageLayer);
		else if (layer.type === 'text') paintText(ctx, layer as TextLayer);
		else if (layer.type === 'shape') paintShape(ctx, layer as ShapeLayer);

		ctx.restore();
	}

	return canvas;
}

export async function exportSceneAsPNG(
	scene: SceneSnapshot,
	options: { scale?: number } = {}
): Promise<Blob> {
	const canvas = await renderSceneToCanvas(scene, options);
	return new Promise<Blob>((resolve, reject) => {
		canvas.toBlob((b) => {
			if (b) resolve(b);
			else reject(new Error('canvas.toBlob returned null'));
		}, 'image/png');
	});
}

async function ensureFontsLoaded(layers: Layer[]): Promise<void> {
	if (typeof document === 'undefined' || !document.fonts) return;
	const needed = new Set<string>();
	for (const l of layers) {
		if (l.type === 'text') {
			const t = l as TextLayer;
			const font = fontById(t.font);
			needed.add(`${t.weight} ${t.size}px "${font.family}"`);
		}
	}
	await Promise.allSettled(Array.from(needed).map((f) => document.fonts.load(f)));
}

async function paintImage(ctx: CanvasRenderingContext2D, layer: ImageLayer): Promise<void> {
	try {
		const img = await loadImage(layer.src);
		ctx.drawImage(img, 0, 0, layer.w, layer.h);
		if (layer.filter === 'grayscale') {
			const imgData = ctx.getImageData(0, 0, layer.w, layer.h);
			const data = imgData.data;
			for (let i = 0; i < data.length; i += 4) {
				const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
				data[i] = data[i + 1] = data[i + 2] = gray;
			}
			ctx.putImageData(imgData, 0, 0);
		}
	} catch (err) {
		console.warn('image paint failed', err);
	}
}

function loadImage(src: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.crossOrigin = 'anonymous';
		img.onload = () => resolve(img);
		img.onerror = () => reject(new Error('image load failed'));
		img.src = src;
	});
}

function paintText(ctx: CanvasRenderingContext2D, layer: TextLayer) {
	const font = fontById(layer.font);
	ctx.font = `${layer.weight} ${layer.size}px "${font.family}", sans-serif`;
	ctx.textBaseline = 'middle';
	ctx.textAlign = layer.align === 'left' ? 'left' : layer.align === 'right' ? 'right' : 'center';

	const lines = layer.text.split(/\r?\n/);
	const lineHeight = layer.size * 1.05;
	const totalHeight = lines.length * lineHeight;
	const startY = layer.h / 2 - totalHeight / 2 + lineHeight / 2;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		const x =
			layer.align === 'left' ? 0 : layer.align === 'right' ? layer.w : layer.w / 2;
		const y = startY + i * lineHeight;

		if (layer.shadow) {
			ctx.save();
			ctx.fillStyle = layer.shadow.color;
			ctx.fillText(line, x + layer.shadow.dx, y + layer.shadow.dy);
			ctx.restore();
		}

		if (layer.stroke) {
			ctx.save();
			ctx.lineWidth = layer.stroke.width * 2;
			ctx.strokeStyle = layer.stroke.color;
			ctx.lineJoin = 'round';
			ctx.strokeText(line, x, y);
			ctx.restore();
		}

		ctx.fillStyle = layer.color;
		ctx.fillText(line, x, y);
	}
}

function paintShape(ctx: CanvasRenderingContext2D, layer: ShapeLayer) {
	const d = shapePath(layer.shape, layer.w, layer.h, layer.cornerRadius ?? 0);
	const path = new Path2D(d);
	ctx.fillStyle = layer.fill;
	ctx.fill(path);
	if (layer.strokeWidth > 0) {
		ctx.lineWidth = layer.strokeWidth;
		ctx.strokeStyle = layer.strokeColor;
		ctx.lineJoin = 'round';
		ctx.stroke(path);
	}
}
