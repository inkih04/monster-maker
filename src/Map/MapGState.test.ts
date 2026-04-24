/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useMapStore } from './MapGState';

vi.mock('../Project/ProjectConfigGState', () => ({
	useProjectStore: {
		getState: vi.fn(() => ({ currentProject: { name: 'TestProj', path: '/proj', defaultTilesize: 16 } })),
	},
}));

const mockAddTileSet = vi.fn();
vi.mock('../Tileset/TileSetGState', () => ({
	useTileSetStore: {
		getState: vi.fn(() => ({
			tilesets: {
				'existing/path.png': { subImages: [] },
			},
			addTileSet: mockAddTileSet,
		})),
	},
}));

vi.mock('./mapUtils', () => ({
	createTileEntity: vi.fn((id, layer, mapX, mapY, tsX, tsY, size, path) => ({
		id,
		tag: 'TILEMAP',
		layer,
		components: {
			POSITION: { x: mapX * size, y: mapY * size },
			RENDER: { x: tsX * size, y: tsY * size, spriteSheetPath: path },
		},
	})),
	loadSingleTileset: vi.fn().mockResolvedValue({ id: 'new_tileset' }),
}));

describe('useMapStore', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		useMapStore.getState().reset();
	});

	it('should have correct default state', () => {
		const state = useMapStore.getState();
		expect(state.map?.mapId).toBe('1');
		expect(state.zoom).toBe(1);
		expect(state.activeLayer).toBe('ground');
		expect(state.paintedTiles).toEqual([]);
		expect(state.selectedEntityIds).toEqual([]);
		expect(state.showCollisions).toBe(false);
	});

	it('should update simple states', () => {
		const store = useMapStore.getState();

		store.setZoom(2.5);
		expect(useMapStore.getState().zoom).toBe(2.5);

		store.setActiveLayer('entities');
		expect(useMapStore.getState().activeLayer).toBe('entities');

		store.setShowCollisions(true);
		expect(useMapStore.getState().showCollisions).toBe(true);

		store.toggleShowCollisions();
		expect(useMapStore.getState().showCollisions).toBe(false);

		store.setMapScript('/scripts/main.ts');
		expect(useMapStore.getState().mapScript).toBe('/scripts/main.ts');
		expect(useMapStore.getState().isDirty).toBe(true);

		store.toggleLayerVisibility('ground');
		expect(useMapStore.getState().visibleLayers.ground).toBe(false);

		store.toggleLayerLocked('decoration');
		expect(useMapStore.getState().lockedLayers.decoration).toBe(true);
	});

	it('should create a new map', () => {
		useMapStore.getState().createMap('map_2', 50, 50, 32);

		const state = useMapStore.getState();
		expect(state.map).toEqual({
			mapId: 'map_2',
			width: 50,
			height: 50,
			tileSize: 32,
			entities: {},
			mapScript: null,
		});
		expect(state.paintedTiles).toEqual([]);
		expect(state.isDirty).toBe(false);
	});

	it('should load a map and populate painted tiles', async () => {
		const mockMap = {
			mapId: 'map_3',
			width: 20,
			height: 20,
			tileSize: 16,
			entities: {
				ent1: {
					id: 'ent1',
					layer: 'ground',
					components: {
						POSITION: { x: 32, y: 16 },
						RENDER: { x: 0, y: 0, spriteSheetPath: 'existing/path.png' },
					},
				},
			},
		};

		await useMapStore.getState().loadMap(mockMap as any);

		const state = useMapStore.getState();
		expect(state.isLoadingMap).toBe(false);
		expect(state.map?.mapId).toBe('map_3');
		expect(state.paintedTiles.length).toBe(1);
		expect(state.paintedTiles[0]).toEqual({
			x: 2,
			y: 1,
			tilesetX: 0,
			tilesetY: 0,
			entityId: 'ent1',
			layer: 'ground',
			spriteSheetPath: 'existing/path.png',
		});
	});

	it('should manage entities', () => {
		const store = useMapStore.getState();
		const entity = { id: 'e1', name: 'Hero', layer: 'entities', components: {} };

		store.addEntity(entity as any);
		expect(useMapStore.getState().map?.entities['e1']).toBeDefined();

		store.updateEntity('e1', { name: 'Villain' });
		expect(useMapStore.getState().map?.entities['e1'].name).toBe('Villain');

		store.removeEntity('e1');
		expect(useMapStore.getState().map?.entities['e1']).toBeUndefined();
	});



	it('should paint tiles and replace existing ones', () => {
		const store = useMapStore.getState();
		
		store.paintTiles([{
			mapX: 5, mapY: 5, tilesetX: 1, tilesetY: 1, entityId: 't1', layer: 'ground', tileSize: 16, spriteSheetPath: 'sheet.png'
		}]);

		let state = useMapStore.getState();
		expect(state.paintedTiles.length).toBe(1);
		expect(state.map?.entities['t1']).toBeDefined();

		store.paintTiles([{
			mapX: 5, mapY: 5, tilesetX: 2, tilesetY: 2, entityId: 't2', layer: 'ground', tileSize: 16, spriteSheetPath: 'sheet.png'
		}]);

		state = useMapStore.getState();
		expect(state.paintedTiles.length).toBe(1);
		expect(state.paintedTiles[0].entityId).toBe('t2');
		expect(state.map?.entities['t1']).toBeUndefined();
		expect(state.map?.entities['t2']).toBeDefined();
	});

	it('should manage tile selection', () => {
		const store = useMapStore.getState();
		useMapStore.setState({
			paintedTiles: [{ x: 2, y: 2, tilesetX: 0, tilesetY: 0, layer: 'ground', entityId: 'ent1', spriteSheetPath: '' }]
		});

		store.setSelectedTilePosition({ x: 2, y: 2, layer: 'ground' });
		expect(useMapStore.getState().selectedTilePositions.length).toBe(1);
		expect(useMapStore.getState().selectedEntityIds).toEqual(['ent1']);

		store.toggleSelectedTilePosition({ x: 3, y: 3, layer: 'ground' });
		expect(useMapStore.getState().selectedTilePositions.length).toBe(2);

		store.toggleSelectedTilePosition({ x: 2, y: 2, layer: 'ground' });
		expect(useMapStore.getState().selectedTilePositions.length).toBe(1);
		expect(useMapStore.getState().selectedEntityIds).toEqual([]);

		store.clearSelection();
		expect(useMapStore.getState().selectedTilePositions).toEqual([]);
		expect(useMapStore.getState().selectedEntityIds).toEqual([]);
	});

	it('should clear map tiles', () => {
		const store = useMapStore.getState();
		store.addEntity({ id: 'e1', tag: 'PLAYER', components: {} } as any);
		store.addEntity({ id: 't1', tag: 'TILEMAP', components: {} } as any);
		
		useMapStore.setState({
			paintedTiles: [{ x: 0, y: 0, tilesetX: 0, tilesetY: 0, layer: 'ground', entityId: 't1', spriteSheetPath: '' }]
		});

		store.clearMapTiles();

		const state = useMapStore.getState();
		expect(state.paintedTiles.length).toBe(0);
		expect(state.map?.entities['t1']).toBeUndefined();
		expect(state.map?.entities['e1']).toBeDefined();
	});

	it('should export to engine format', () => {
		const store = useMapStore.getState();
		store.addEntity({ id: 'e1', components: {} } as any);
		store.setMapScript('script.ts');

		const jsonStr = store.exportToEngineFormat();
		const parsed = JSON.parse(jsonStr);

		expect(parsed.mapId).toBe('1');
		expect(parsed.mapScript).toBe('script.ts');
		expect(parsed.entities).toHaveLength(1);
		expect(parsed.entities[0].id).toBe('e1');
	});
});