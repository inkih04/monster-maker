import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTileSetStore, TileSetData, TileSelection } from './TileSetGState';

describe('useTileSetStore', () => {
	const mockTileSet: TileSetData = {
		id: 'ts_1',
		pathImg: '/path/to/img.png',
		relativePath: 'img.png',
		pathTileMapConfig: '/path/to/config.json',
		tileSizeX: 16,
		tileSizeY: 16,
		isLoaded: true,
	};

	beforeEach(() => {
		useTileSetStore.getState().reset();
		vi.restoreAllMocks();
	});

	it('should have correct initial state', () => {
		const state = useTileSetStore.getState();
		expect(state.tilesets).toEqual({});
		expect(state.currentTileSetPath).toBeNull();
		expect(state.selectedArea).toBeNull();
		expect(state.zoom).toBe(1);
		expect(state.isTileSizeOpen).toBe(false);
	});

	it('should update simple states (zoom, dialogs, selected area)', () => {
		const store = useTileSetStore.getState();

		store.setZoom(2.5);
		expect(useTileSetStore.getState().zoom).toBe(2.5);

		store.openTileSizeDialog();
		expect(useTileSetStore.getState().isTileSizeOpen).toBe(true);

		store.closeTileSizeDialog();
		expect(useTileSetStore.getState().isTileSizeOpen).toBe(false);

		const selection: TileSelection = { startX: 0, startY: 0, endX: 1, endY: 1 };
		store.setSelectedArea(selection);
		expect(useTileSetStore.getState().selectedArea).toEqual(selection);

		store.setSelectedArea(null);
		expect(useTileSetStore.getState().selectedArea).toBeNull();
	});

	it('should add a tileset and set it as current', () => {
		const store = useTileSetStore.getState();

		store.addTileSet(mockTileSet);
		expect(useTileSetStore.getState().tilesets['img.png']).toEqual(mockTileSet);

		store.setCurrentTileSet('img.png');
		expect(useTileSetStore.getState().currentTileSetPath).toBe('img.png');
	});

	it('should warn when setting an invalid current tileset', () => {
		const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const store = useTileSetStore.getState();

		store.setCurrentTileSet('invalid.png');
		expect(useTileSetStore.getState().currentTileSetPath).toBeNull();
		expect(consoleSpy).toHaveBeenCalledWith('TileSet with "invalid.png" does not exist');
	});

	it('should set tileset loaded status', () => {
		const store = useTileSetStore.getState();
		store.addTileSet({ ...mockTileSet, isLoaded: false });

		store.setTileSetLoaded('img.png', true);
		expect(useTileSetStore.getState().tilesets['img.png'].isLoaded).toBe(true);

		// Setting on non-existent path should gracefully do nothing
		store.setTileSetLoaded('ghost.png', true);
		expect(useTileSetStore.getState().tilesets['ghost.png']).toBeUndefined();
	});

	it('should update tileset properties', () => {
		const store = useTileSetStore.getState();
		store.addTileSet(mockTileSet);

		store.updateTileSet('img.png', { atlasWidth: 256, tileSizeX: 32 });
		expect(useTileSetStore.getState().tilesets['img.png'].atlasWidth).toBe(256);
		expect(useTileSetStore.getState().tilesets['img.png'].tileSizeX).toBe(32);
		expect(useTileSetStore.getState().tilesets['img.png'].tileSizeY).toBe(16); // Preserves original
	});

	it('should warn when updating a non-existent tileset', () => {
		const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const store = useTileSetStore.getState();

		store.updateTileSet('ghost.png', { atlasWidth: 256 });
		expect(consoleSpy).toHaveBeenCalledWith('TileSet with path "ghost.png" does not exist');
	});

	it('should remove a tileset and clear current selection if it was current', () => {
		const store = useTileSetStore.getState();
		store.addTileSet(mockTileSet);
		store.setCurrentTileSet('img.png');
		store.setSelectedArea({ startX: 0, startY: 0, endX: 1, endY: 1 });

		store.removeTileSet('img.png');

		const state = useTileSetStore.getState();
		expect(state.tilesets['img.png']).toBeUndefined();
		expect(state.currentTileSetPath).toBeNull();
		expect(state.selectedArea).toBeNull();
	});

	it('should remove a tileset but preserve current selections if they belong to another tileset', () => {
		const store = useTileSetStore.getState();
		const mockTileSet2 = { ...mockTileSet, relativePath: 'img2.png', id: 'ts_2' };
		
		store.addTileSet(mockTileSet);
		store.addTileSet(mockTileSet2);
		
		store.setCurrentTileSet('img.png');
		store.setSelectedArea({ startX: 2, startY: 2, endX: 3, endY: 3 });
		
		store.removeTileSet('img2.png');

		const state = useTileSetStore.getState();
		expect(state.tilesets['img2.png']).toBeUndefined();
		expect(state.tilesets['img.png']).toBeDefined();
		expect(state.currentTileSetPath).toBe('img.png');
		expect(state.selectedArea).not.toBeNull();
	});

	it('should reset state correctly', () => {
		const store = useTileSetStore.getState();
		store.addTileSet(mockTileSet);
		store.setCurrentTileSet('img.png');
		store.setZoom(5);
		store.openTileSizeDialog();
		store.setSelectedArea({ startX: 0, startY: 0, endX: 1, endY: 1 });

		store.reset();

		const state = useTileSetStore.getState();
		expect(state.tilesets).toEqual({});
		expect(state.currentTileSetPath).toBeNull();
		expect(state.selectedArea).toBeNull();
		expect(state.zoom).toBe(1);
		expect(state.isTileSizeOpen).toBe(false);
	});
});