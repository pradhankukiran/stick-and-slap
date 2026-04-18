export interface FontMeta {
	id: string;
	label: string;
	family: string;
	weight: number;
}

export const FONTS: FontMeta[] = [
	{ id: 'display', label: 'Chunk', family: 'Archivo Black', weight: 400 },
	{ id: 'ui', label: 'Clean', family: 'Space Grotesk Variable', weight: 700 },
	{ id: 'mono', label: 'Mono', family: 'DM Mono', weight: 500 },
	{ id: 'hand', label: 'Hand', family: 'Caveat', weight: 700 }
];

export function fontById(id: string): FontMeta {
	return FONTS.find((f) => f.id === id) ?? FONTS[0];
}
