import { describe, it, expect } from 'vitest';
import { getSelectionInfo, getFileNameFromPath } from './TileSetUtils';
import { TileSelection } from './TileSetGState';

describe('TileSetUtils', () => {
	describe('getSelectionInfo', () => {
		it('should return null when selectedArea is null', () => {
			expect(getSelectionInfo(null)).toBeNull();
		});

		it('should calculate correct dimensions for a top-left to bottom-right selection', () => {
			const selection: TileSelection = { startX: 2, startY: 3, endX: 5, endY: 7 };
			const result = getSelectionInfo(selection);
			
			expect(result).toEqual({
				minX: 2,
				minY: 3,
				width: 4,  // 5 - 2 + 1
				height: 5, // 7 - 3 + 1
			});
		});

		it('should calculate correct dimensions for a bottom-right to top-left selection', () => {
			const selection: TileSelection = { startX: 5, startY: 7, endX: 2, endY: 3 };
			const result = getSelectionInfo(selection);
			
			expect(result).toEqual({
				minX: 2,
				minY: 3,
				width: 4,
				height: 5,
			});
		});

		it('should calculate correct dimensions for a single tile selection', () => {
			const selection: TileSelection = { startX: 4, startY: 4, endX: 4, endY: 4 };
			const result = getSelectionInfo(selection);
			
			expect(result).toEqual({
				minX: 4,
				minY: 4,
				width: 1,
				height: 1,
			});
		});
	});

	describe('getFileNameFromPath', () => {
		it('should return an empty string if path is undefined', () => {
			expect(getFileNameFromPath(undefined)).toBe('');
		});

		it('should return an empty string if path is empty', () => {
			expect(getFileNameFromPath('')).toBe('');
		});

		it('should extract the file name from a full path with forward slashes', () => {
			expect(getFileNameFromPath('assets/images/characters/hero.png')).toBe('hero.png');
		});

		it('should return the full string if there are no slashes', () => {
			expect(getFileNameFromPath('tileset.png')).toBe('tileset.png');
		});

		it('should return "Nombre.png" as fallback if the path ends with a slash', () => {
			expect(getFileNameFromPath('folder/path/')).toBe('Nombre.png');
		});
	});
});