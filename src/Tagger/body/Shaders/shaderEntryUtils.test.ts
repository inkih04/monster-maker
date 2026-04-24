import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
	shadersToEntries,
	entriesToShaders,
	DEFAULT_SHADER_TAG,
	ShaderEntry,
} from './shaderEntryUtils';

describe('shaderEntryUtils', () => {
	beforeEach(() => {
		let counter = 0;
		vi.stubGlobal('crypto', {
			randomUUID: () => `mock-uuid-${counter++}`,
		});
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	describe('shadersToEntries', () => {
		it('should return a default entry if the shaders record is empty', () => {
			const result = shadersToEntries({});

			expect(result).toHaveLength(1);
			expect(result[0]).toEqual({
				id: 'mock-uuid-0',
				tag: DEFAULT_SHADER_TAG,
				mode: 0,
			});
		});

		it('should convert a populated shaders record to an array of entries', () => {
			const shaders = {
				water: 1,
				lava: 2,
			};

			const result = shadersToEntries(shaders);

			expect(result).toHaveLength(2);
			expect(result[0]).toEqual({
				id: 'mock-uuid-0',
				tag: 'water',
				mode: 1,
			});
			expect(result[1]).toEqual({
				id: 'mock-uuid-1',
				tag: 'lava',
				mode: 2,
			});
		});
	});

	describe('entriesToShaders', () => {
		it('should convert an array of valid entries to a shaders record', () => {
			const entries: ShaderEntry[] = [
				{ id: '1', tag: 'water', mode: 1 },
				{ id: '2', tag: 'lava', mode: 2 },
			];

			const result = entriesToShaders(entries);

			expect(result).toEqual({
				water: 1,
				lava: 2,
			});
		});

		it('should filter out entries with empty tags or empty string modes', () => {
			const entries: ShaderEntry[] = [
				{ id: '1', tag: 'water', mode: 1 },
				{ id: '2', tag: '', mode: 2 }, // Empty tag
				{ id: '3', tag: '   ', mode: 3 }, // Whitespace-only tag
				{ id: '4', tag: 'lava', mode: '' }, // Empty mode
			];

			const result = entriesToShaders(entries);

			expect(result).toEqual({
				water: 1,
			});
		});

		it('should trim whitespace from tags', () => {
			const entries: ShaderEntry[] = [{ id: '1', tag: '  wind  ', mode: 4 }];

			const result = entriesToShaders(entries);

			expect(result).toEqual({
				wind: 4,
			});
		});
	});
});
