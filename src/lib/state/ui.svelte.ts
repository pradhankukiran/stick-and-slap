export type Tool = 'select' | 'text' | 'rect' | 'circle' | 'speech' | 'star' | 'arrow' | 'sticker' | 'emoji';

import type { SnapGuide } from '$lib/geom/snap';

class UIState {
	tool = $state<Tool>('select');
	zoom = $state<number>(1);
	snapEnabled = $state<boolean>(true);
	showGrid = $state<boolean>(false);
	pickerOpen = $state<'none' | 'sticker' | 'emoji' | 'font'>('none');
	reducedMotion = $state<boolean>(false);
	modePicked = $state<boolean>(false);
	activeGuides = $state<SnapGuide[]>([]);
	autoEditId = $state<string | null>(null);

	constructor() {
		if (typeof window !== 'undefined') {
			const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
			this.reducedMotion = mq.matches;
			mq.addEventListener?.('change', (e) => (this.reducedMotion = e.matches));
		}
	}

	setTool(t: Tool) {
		this.tool = t;
	}

	toggleSnap() {
		this.snapEnabled = !this.snapEnabled;
	}

	setZoom(z: number) {
		this.zoom = Math.max(0.1, Math.min(4, z));
	}

	openPicker(p: 'sticker' | 'emoji' | 'font') {
		this.pickerOpen = p;
	}

	closePicker() {
		this.pickerOpen = 'none';
	}
}

export const ui = new UIState();
