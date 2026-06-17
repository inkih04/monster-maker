/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useBrushTool } from './useBrushTool';
import { useMapStore } from '../../Map/MapGState';
import { useTileSetStore } from '../../Tileset/TileSetGState';

vi.mock('../../Map/MapGState', () => ({
	useMapStore: vi.fn(),
}));

vi.mock('../../Tileset/TileSetGState', () => ({
	useTileSetStore: vi.fn(),
}));

describe('useBrushTool', () => {
	const mockPaintTiles = vi.fn();
	const mockSetIsDirty = vi.fn();

	const setupMocks = (mapStateOverrides = {}, tileSetStateOverrides = {}) => {
		(useMapStore as any).mockImplementation((selector: any) =>
			selector({
				activeLayer: 'ground',
				paintTiles: mockPaintTiles,
				setIsDirty: mockSetIsDirty,
				...mapStateOverrides,
			})
		);

		(useTileSetStore as any).mockImplementation((selector: any) =>
			selector({
				tilesets: {},
				currentTileSetPath: null,
				selectedArea: null,
				...tileSetStateOverrides,
			})
		);
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should return initial state correctly', () => {
		setupMocks();
		const { result } = renderHook(() => useBrushTool());

		expect(result.current.isActive).toBe(false);
		expect(result.current.previewPosition).toBeNull();
	});

	it('should update isActive and previewPosition', () => {
		setupMocks();
		const { result } = renderHook(() => useBrushTool());

		act(() => {
			result.current.setIsActive(true);
			result.current.setPreviewPosition({ x: 10, y: 15 });
		});

		expect(result.current.isActive).toBe(true);
		expect(result.current.previewPosition).toEqual({ x: 10, y: 15 });
	});

	it('should not paint if there is no current tileset', () => {
		setupMocks();
		const { result } = renderHook(() => useBrushTool());

		act(() => {
			result.current.onTileClick(5, 5);
		});

		expect(mockPaintTiles).not.toHaveBeenCalled();
		expect(mockSetIsDirty).not.toHaveBeenCalled();
	});

	it('should paint a single tile when no area is selected', () => {
		setupMocks(
			{ activeLayer: 'decoration' },
			{
				currentTileSetPath: 'test.png',
				tilesets: {
					'test.png': {
						pathImg: '/full/path/test.png',
						relativePath: 'test.png',
						tileSizeX: 32,
					},
				},
				selectedArea: null,
			}
		);

		const { result } = renderHook(() => useBrushTool());

		act(() => {
			result.current.onTileClick(2, 3);
		});

		expect(mockSetIsDirty).toHaveBeenCalledWith(true);
		expect(mockPaintTiles).toHaveBeenCalledWith([
			{
				mapX: 2,
				mapY: 3,
				tilesetX: 0,
				tilesetY: 0,
				entityId: expect.any(String),
				layer: 'decoration',
				tileSize: 32,
				spriteSheetPath: 'test.png',
			},
		]);
	});

	it('should paint multiple tiles when an area is selected', () => {
		setupMocks(
			{ activeLayer: 'ground' },
			{
				currentTileSetPath: 'sheet.png',
				tilesets: {
					'sheet.png': {
						pathImg: '/full/path/sheet.png',
						relativePath: 'sheet.png',
						tileSizeX: 16,
					},
				},
				selectedArea: { startX: 1, startY: 1, endX: 2, endY: 2 },
			}
		);

		const { result } = renderHook(() => useBrushTool());

		act(() => {
			result.current.onTileDrag(5, 5);
		});

		expect(mockSetIsDirty).toHaveBeenCalledWith(true);
		expect(mockPaintTiles).toHaveBeenCalledWith([
			{
				mapX: 5,
				mapY: 5,
				tilesetX: 1,
				tilesetY: 1,
				entityId: expect.any(String),
				layer: 'ground',
				tileSize: 16,
				spriteSheetPath: 'sheet.png',
			},
			{
				mapX: 6,
				mapY: 5,
				tilesetX: 2,
				tilesetY: 1,
				entityId: expect.any(String),
				layer: 'ground',
				tileSize: 16,
				spriteSheetPath: 'sheet.png',
			},
			{
				mapX: 5,
				mapY: 6,
				tilesetX: 1,
				tilesetY: 2,
				entityId: expect.any(String),
				layer: 'ground',
				tileSize: 16,
				spriteSheetPath: 'sheet.png',
			},
			{
				mapX: 6,
				mapY: 6,
				tilesetX: 2,
				tilesetY: 2,
				entityId: expect.any(String),
				layer: 'ground',
				tileSize: 16,
				spriteSheetPath: 'sheet.png',
			},
		]);
	});

	it('should handle negative drag areas correctly', () => {
		setupMocks(
			{ activeLayer: 'entities' },
			{
				currentTileSetPath: 'sheet.png',
				tilesets: {
					'sheet.png': {
						pathImg: '/full/path/sheet.png',
						relativePath: 'sheet.png',
						tileSizeX: 16,
					},
				},
				selectedArea: { startX: 2, startY: 2, endX: 1, endY: 1 },
			}
		);

		const { result } = renderHook(() => useBrushTool());

		act(() => {
			result.current.onTileClick(10, 10);
		});

		expect(mockPaintTiles).toHaveBeenCalled();
		const paintedArray = mockPaintTiles.mock.calls[0][0];
		expect(paintedArray).toHaveLength(4);
		
		expect(paintedArray).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ mapX: 10, mapY: 10, tilesetX: 1, tilesetY: 1 }),
				expect.objectContaining({ mapX: 11, mapY: 10, tilesetX: 2, tilesetY: 1 }),
				expect.objectContaining({ mapX: 10, mapY: 11, tilesetX: 1, tilesetY: 2 }),
				expect.objectContaining({ mapX: 11, mapY: 11, tilesetX: 2, tilesetY: 2 }),
			])
		);
	});
});