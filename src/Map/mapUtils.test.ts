/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	getSubImageForTile,
	createTileEntity,
	drawCollisionDebug,
	drawBrushPreview,
	drawEraserPreview,
	drawSelectionPreview,
	drawSelectionOverlay,
	loadSingleTileset,
	drawAreaCopyPreview
} from './mapUtils';

const mockPathUnion = vi.fn((...args) => Promise.resolve(args.join('/')));
const mockGetFile = vi.fn();

(window as any).api = {
	pathUnion: mockPathUnion,
	getFile: mockGetFile,
};

describe('mapUtils', () => {
	let mockCtx: any;
	let dummyImage: HTMLImageElement;

	beforeEach(() => {
		vi.clearAllMocks();
		
		mockCtx = {
			save: vi.fn(),
			restore: vi.fn(),
			fillRect: vi.fn(),
			strokeRect: vi.fn(),
			drawImage: vi.fn(),
			fillStyle: '',
			strokeStyle: '',
			lineWidth: 1,
			globalAlpha: 1,
		};

		dummyImage = {} as HTMLImageElement;
	});

	describe('getSubImageForTile', () => {
		it('should return null subImagePath and absolute coords if no subImages provided', () => {
			const result = getSubImageForTile(2, 3, 16);
			expect(result).toEqual({ subImagePath: null, localX: 32, localY: 48 });
		});

		it('should find subImage and calculate local coordinates correctly', () => {
			const subImages = [
				{ file: 'sub1.png', atlasOffsetX: 0, atlasOffsetY: 0, widthInTiles: 2, heightInTiles: 2 },
				{ file: 'sub2.png', atlasOffsetX: 32, atlasOffsetY: 32, widthInTiles: 2, heightInTiles: 2 },
			];

			const result = getSubImageForTile(2, 2, 16, subImages);
			expect(result).toEqual({ subImagePath: 'sub2.png', localX: 0, localY: 0 });

			const result2 = getSubImageForTile(3, 2, 16, subImages);
			expect(result2).toEqual({ subImagePath: 'sub2.png', localX: 16, localY: 0 });
		});

		it('should return absolute coords if coordinates fall outside any subImage', () => {
			const subImages = [
				{ file: 'sub1.png', atlasOffsetX: 0, atlasOffsetY: 0, widthInTiles: 2, heightInTiles: 2 },
			];
			const result = getSubImageForTile(5, 5, 16, subImages);
			expect(result).toEqual({ subImagePath: null, localX: 80, localY: 80 });
		});
	});

	describe('createTileEntity', () => {
		it('should create an entity with original path if no subImages match', () => {
			const entity = createTileEntity('ent_1', 'ground', 5, 5, 1, 1, 16, 'sprites/main.png', 16);
			
			expect(entity.id).toBe('ent_1');
			expect(entity.layer).toBe('ground');
			expect(entity.tag).toBe('TILEMAP');
			expect(entity.components.POSITION).toEqual({ x: 80, y: 80, rotation: 0 });
			expect(entity.components.RENDER).toEqual({
				spriteSheetPath: 'sprites/main.png',
				x: 16,
				y: 16,
				w: 16,
				h: 16,
				width: 16,
				height: 16,
				shader: 'default'
			});
		});

		it('should create an entity with combined path and local coords when subImage matches', () => {
			const subImages = [
				{ file: 'tree.png', atlasOffsetX: 16, atlasOffsetY: 16, widthInTiles: 2, heightInTiles: 2 },
			];
			const entity = createTileEntity('ent_2', 'decoration', 0, 0, 1, 1, 16, 'sprites/main.png', 16, subImages);
			
			expect(entity.components.RENDER?.spriteSheetPath).toBe('sprites/tree.png');
			expect(entity.components.RENDER?.x).toBe(0);
			expect(entity.components.RENDER?.y).toBe(0);
		});
	});

	describe('drawCollisionDebug', () => {
		it('should draw correct styles for trigger and non-trigger colliders', () => {
			const entities: any = {
				e1: {
					components: {
						POSITION: { x: 10, y: 10 },
						COLLIDER: { width: 20, height: 20, isTrigger: true }
					}
				},
				e2: {
					components: {
						POSITION: { x: 50, y: 50 },
						COLLIDER: { width: 10, height: 10, isTrigger: false, offsetX: 5, offsetY: 5 }
					}
				}
			};

			drawCollisionDebug({ ctx: mockCtx, entities, zoom: 2 });

			expect(mockCtx.save).toHaveBeenCalledTimes(2);
			expect(mockCtx.restore).toHaveBeenCalledTimes(2);
			expect(mockCtx.fillRect).toHaveBeenCalledTimes(2);
			expect(mockCtx.strokeRect).toHaveBeenCalledTimes(2);

			expect(mockCtx.fillRect).toHaveBeenNthCalledWith(1, 20, 20, 40, 40);
			expect(mockCtx.fillRect).toHaveBeenNthCalledWith(2, 110, 110, 20, 20);
		});
	});

	describe('drawBrushPreview', () => {
		it('should return early if isActive is true or missing required parameters', () => {
			drawBrushPreview({
				ctx: mockCtx,
				previewPosition: { x: 0, y: 0 },
				isActive: true,
				currentTileSet: {} as any,
				currentTileSetPath: 'path',
				tilesetImages: {},
				selectedArea: null,
				zoom: 1,
				mapTileSize: 16
			});
			expect(mockCtx.drawImage).not.toHaveBeenCalled();
		});


		it('should draw multi-tile preview when selectedArea is provided', () => {
			drawBrushPreview({
				ctx: mockCtx,
				previewPosition: { x: 2, y: 2 },
				isActive: false,
				currentTileSet: { tileSizeX: 16, tileSizeY: 16 } as any,
				currentTileSetPath: 'tiles.png',
				tilesetImages: { 'tiles.png': dummyImage },
				selectedArea: { startX: 0, startY: 0, endX: 1, endY: 1 },
				zoom: 1,
				mapTileSize: 16
			});

			expect(mockCtx.drawImage).toHaveBeenCalledTimes(4);
		});
	});

	describe('drawEraserPreview and drawSelectionPreview', () => {
		const mockPaintedTiles: any = [
			{ x: 1, y: 1, layer: 'ground', entityId: 'ent1' }
		];
		const mockEntities: any = {
			ent1: {
				components: {
					RENDER: { spriteSheetPath: 'tiles.png', x: 0, y: 0, w: 16, h: 16, width: 16, height: 16 }
				}
			}
		};

		it('should draw eraser preview correctly', () => {
			drawEraserPreview({
				ctx: mockCtx,
				previewPosition: { x: 1, y: 1 },
				isActive: false,
				paintedTiles: mockPaintedTiles,
				activeLayer: 'ground',
				tilesetImages: { 'tiles.png': dummyImage },
				zoom: 1,
				entities: mockEntities,
				isLayerLocked: false
			});

			expect(mockCtx.drawImage).toHaveBeenCalledWith(dummyImage, 0, 0, 16, 16, 16, 16, 16, 16);
			expect(mockCtx.fillStyle).toBe('rgba(255, 50, 50, 0.4)');
			expect(mockCtx.fillRect).toHaveBeenCalledWith(16, 16, 16, 16);
		});

		it('should draw selection preview correctly', () => {
			drawSelectionPreview({
				ctx: mockCtx,
				previewPosition: { x: 1, y: 1 },
				isActive: false,
				paintedTiles: mockPaintedTiles,
				activeLayer: 'ground',
				tilesetImages: { 'tiles.png': dummyImage },
				zoom: 2,
				entities: mockEntities,
				isLayerLocked: true
			});

			expect(mockCtx.drawImage).toHaveBeenCalledWith(dummyImage, 0, 0, 16, 16, 32, 32, 32, 32);
			expect(mockCtx.fillStyle).toBe('rgba(220, 30, 30, 0.6)');
			expect(mockCtx.fillRect).toHaveBeenCalledWith(32, 32, 32, 32);
		});
	});

	describe('drawSelectionOverlay', () => {
		it('should draw overlays for selected tiles', () => {
			const positions: any = [
				{ x: 1, y: 1 },
				{ x: 2, y: 1 }
			];

			drawSelectionOverlay({ ctx: mockCtx, selectedTilePositions: positions, tileSize: 16, zoom: 1 });

			expect(mockCtx.fillRect).toHaveBeenCalledTimes(2);
			expect(mockCtx.strokeRect).toHaveBeenCalledTimes(2);
			
			expect(mockCtx.fillStyle).toBe('rgba(0, 200, 255, 0.35)'); 
			expect(mockCtx.strokeStyle).toBe('rgba(0, 180, 255, 0.8)');
		});
	});

	describe('loadSingleTileset', () => {
		it('should load tileset data successfully', async () => {
			mockGetFile.mockResolvedValue({
				success: true,
				content: { content: '{"atlasWidth": 256}' }
			});

			const project: any = { path: '/root', name: 'proj', defaultTilesize: 32 };
			const result = await loadSingleTileset('sprites/tiles.png', project);

			expect(result).not.toBeNull();
			expect(result?.relativePath).toBe('sprites/tiles.png');
			expect(result?.tileSizeX).toBe(32);
			expect(result?.atlasWidth).toBe(256);
			expect(mockPathUnion).toHaveBeenCalled();
		});

		it('should return null on failure', async () => {
			mockGetFile.mockRejectedValue(new Error('Network error'));
			
			const project: any = { path: '/root', name: 'proj' };
			const result = await loadSingleTileset('sprites/tiles.png', project);

			expect(result).toBeNull();
		});
	});

	describe('drawAreaCopyPreview', () => {
		it('should draw copy preview when conditions are met', () => {
			const selectedPositions: any = [{ x: 5, y: 5, layer: 'ground' }];
			const paintedTiles: any = [{ x: 5, y: 5, layer: 'ground', entityId: 'e1' }];
			const entities: any = {
				e1: { components: { RENDER: { spriteSheetPath: 'tiles.png', x: 0, y: 0, w: 16, h: 16, width: 16, height: 16 } } }
			};

			drawAreaCopyPreview({
				ctx: mockCtx,
				previewPosition: { x: 10, y: 10 },
				selectedTilePositions: selectedPositions,
				paintedTiles,
				tilesetImages: { 'tiles.png': dummyImage },
				entities,
				tileSize: 16,
				zoom: 1
			});

			expect(mockCtx.fillRect).toHaveBeenCalledTimes(2);
			expect(mockCtx.strokeRect).toHaveBeenCalledTimes(1);
			expect(mockCtx.drawImage).toHaveBeenCalledWith(dummyImage, 0, 0, 16, 16, 160, 160, 16, 16);
		});
	});
});