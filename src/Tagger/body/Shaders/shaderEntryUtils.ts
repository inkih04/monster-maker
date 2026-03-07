export type ShaderEntry = {
	id: string;
	tag: string;
	mode: number | '';
};

export const DEFAULT_SHADER_TAG = 'default';

export function shadersToEntries(shaders: Record<string, number>): ShaderEntry[] {
	const entries = Object.entries(shaders).map(([tag, mode]) => ({
		id: crypto.randomUUID(),
		tag,
		mode,
	}));
	return entries.length > 0
		? entries
		: [{ id: crypto.randomUUID(), tag: DEFAULT_SHADER_TAG, mode: 0 }];
}

export function entriesToShaders(entries: ShaderEntry[]): Record<string, number> {
	const result: Record<string, number> = {};
	for (const entry of entries) {
		if (entry.tag.trim() !== '' && entry.mode !== '') {
			result[entry.tag.trim()] = entry.mode as number;
		}
	}
	return result;
}
