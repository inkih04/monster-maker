import { create } from 'zustand';
import { temporal } from 'zundo';
import { ComponentMap, ComponentType } from '../domain/ecs/componentMap';
import { Layer } from '../domain/ecs/layer';
import { createTileEntity, loadSingleTileset } from './mapUtils';
import Entity from '../domain/ecs/entity';
import { useProjectStore } from '../Project/ProjectConfigGState';
import { useTileSetStore } from '../Tileset/TileSetGState';

export interface PaintedTile {
	x: number;
	y: number;
	tilesetX: number;
	tilesetY: number;
	entityId: string;
	layer: Layer;
	spriteSheetPath: string;
}

export interface MapData {
	mapId: string;
	width: number;
	height: number;
	tileSize: number;
	entities: Record<string, Entity>;
	mapScript?: string | null;
}

export interface SelectedTilePosition {
	x: number;
	y: number;
	layer: Layer;
}

interface MapStore {
	map: MapData | null;
	paintedTiles: PaintedTile[];
	selectedEntityIds: string[];
	selectedTilePositions: SelectedTilePosition[];
	mapRelativePath: string | null;
	zoom: number;
	activeLayer: Layer;
	isDirty: boolean;
	isLoadingMap: boolean;
	showCollisions: boolean;
	visibleLayers: Record<Layer, boolean>;
	lockedLayers: Record<Layer, boolean>;
	mapScript: string | null;

	readonly selectedEntityId: string | null;
	readonly selectedTilePosition: SelectedTilePosition | null;

	setShowCollisions: (show: boolean) => void;
	toggleShowCollisions: () => void;
	toggleLayerVisibility: (layer: Layer) => void;
	toggleLayerLocked: (layer: Layer) => void;
	setMapScript: (path: string | null) => void;

	setSelectedTilePosition: (position: SelectedTilePosition | null) => void;
	toggleSelectedTilePosition: (position: SelectedTilePosition) => void;
	setSelectedTilePositions: (positions: SelectedTilePosition[]) => void;
	clearSelection: () => void;

	setMapRelativePath: (relativePath: string) => void;
	setIsDirty: (isDirty: boolean) => void;
	setZoom: (zoom: number) => void;
	setActiveLayer: (layer: Layer) => void;
	setIsLoadingMap: (loading: boolean) => void;

	createMap(mapId: string, width: number, height: number, tileSize: number): void;
	loadMap(map: MapData): void;
	addEntity(entity: Entity): void;
	removeEntity(id: string): void;
	updateEntity(id: string, data: Partial<Pick<Entity, 'tag' | 'layer' | 'name'>>): void;
	addComponent<K extends ComponentType>(entityId: string, type: K, data: ComponentMap[K]): void;
	updateComponent<K extends ComponentType>(
		entityId: string,
		type: K,
		data: Partial<ComponentMap[K]>
	): void;
	updateComponentBatch<K extends ComponentType>(
		entityIds: string[],
		type: K,
		data: Partial<ComponentMap[K]>
	): void;
	removeComponent(entityId: string, type: ComponentType): void;
	selectEntity(id: string | null): void;
	clearPaintedTiles(): void;
	paintTiles(
		tiles: Array<{
			mapX: number;
			mapY: number;
			tilesetX: number;
			tilesetY: number;
			entityId: string;
			layer: Layer;
			tileSize: number;
			spriteSheetPath: string;
		}>
	): void;
	clearMapTiles(): void;
	exportToEngineFormat(): string;
	reset: () => void;
}

const DEFAULT_VISIBLE_LAYERS: Record<Layer, boolean> = {
	ground: true,
	decoration: true,
	entities: true,
	shadows: true,
	foreground: true,
};

const DEFAULT_LOCKED_LAYERS: Record<Layer, boolean> = {
	ground: false,
	decoration: false,
	entities: false,
	shadows: false,
	foreground: false,
};

const INITIAL_MAP: MapData = {
	mapId: '1',
	width: 100,
	height: 100,
	tileSize: 16,
	entities: {},
	mapScript: null,
};

export const useMapStore = create<MapStore>()(
	temporal(
		(set, get) => ({
			map: { ...INITIAL_MAP },
			mapRelativePath: null,
			paintedTiles: [],
			isDirty: false,
			selectedEntityIds: [],
			selectedTilePositions: [],
			zoom: 1,
			activeLayer: 'ground',
			isLoadingMap: false,
			showCollisions: false,
			visibleLayers: { ...DEFAULT_VISIBLE_LAYERS },
			lockedLayers: { ...DEFAULT_LOCKED_LAYERS },
			mapScript: null,

			get selectedEntityId() {
				return get().selectedEntityIds[0] ?? null;
			},
			get selectedTilePosition() {
				return get().selectedTilePositions[0] ?? null;
			},

			reset: () => {
				set({
					map: { ...INITIAL_MAP },
					mapRelativePath: null,
					paintedTiles: [],
					isDirty: false,
					selectedEntityIds: [],
					selectedTilePositions: [],
					zoom: 1,
					activeLayer: 'ground' as Layer,
					isLoadingMap: false,
					showCollisions: false,
					visibleLayers: { ...DEFAULT_VISIBLE_LAYERS },
					lockedLayers: { ...DEFAULT_LOCKED_LAYERS },
					mapScript: null,
				});
				useMapStore.temporal.getState().clear();
			},

			setShowCollisions: (show) => set({ showCollisions: show }),

			toggleShowCollisions: () => set((state) => ({ showCollisions: !state.showCollisions })),

			toggleLayerVisibility: (layer) =>
				set((state) => ({
					visibleLayers: { ...state.visibleLayers, [layer]: !state.visibleLayers[layer] },
				})),

			toggleLayerLocked: (layer) =>
				set((state) => ({
					lockedLayers: { ...state.lockedLayers, [layer]: !state.lockedLayers[layer] },
				})),

			setMapScript: (path) =>
				set((state) => ({
					mapScript: path,
					isDirty: true,
					map: state.map ? { ...state.map, mapScript: path } : state.map,
				})),

			setMapRelativePath: (relativePath) => set({ mapRelativePath: relativePath }),

			setIsLoadingMap: (loading) => set({ isLoadingMap: loading }),

			setIsDirty: (isDirty) => set({ isDirty }),

			setActiveLayer: (layer) => set({ activeLayer: layer }),

			setZoom: (zoom) => set({ zoom }),

			setSelectedTilePosition: (position) => {
				if (!position) {
					set({ selectedTilePositions: [], selectedEntityIds: [] });
					return;
				}
				const state = get();
				const tile = state.paintedTiles.find(
					(t) => t.x === position.x && t.y === position.y && t.layer === position.layer
				);
				set({
					selectedTilePositions: [position],
					selectedEntityIds: tile ? [tile.entityId] : [],
				});
			},

			toggleSelectedTilePosition: (position) => {
				const state = get();
				const exists = state.selectedTilePositions.some(
					(p) => p.x === position.x && p.y === position.y && p.layer === position.layer
				);

				if (exists) {
					const newPositions = state.selectedTilePositions.filter(
						(p) => !(p.x === position.x && p.y === position.y && p.layer === position.layer)
					);
					const tile = state.paintedTiles.find(
						(t) => t.x === position.x && t.y === position.y && t.layer === position.layer
					);
					const newEntityIds = tile
						? state.selectedEntityIds.filter((id) => id !== tile.entityId)
						: state.selectedEntityIds;
					set({ selectedTilePositions: newPositions, selectedEntityIds: newEntityIds });
				} else {
					const tile = state.paintedTiles.find(
						(t) => t.x === position.x && t.y === position.y && t.layer === position.layer
					);
					set({
						selectedTilePositions: [...state.selectedTilePositions, position],
						selectedEntityIds: tile
							? [...state.selectedEntityIds, tile.entityId]
							: state.selectedEntityIds,
					});
				}
			},

			setSelectedTilePositions: (positions) => {
				const state = get();
				const entityIds = positions
					.map((pos) => {
						const tile = state.paintedTiles.find(
							(t) => t.x === pos.x && t.y === pos.y && t.layer === pos.layer
						);
						return tile?.entityId ?? null;
					})
					.filter((id): id is string => id !== null);
				set({ selectedTilePositions: positions, selectedEntityIds: entityIds });
			},

			clearSelection: () => set({ selectedTilePositions: [], selectedEntityIds: [] }),

			selectEntity: (id) => {
				set({ selectedEntityIds: id ? [id] : [] });
			},

			createMap: (mapId, width, height, tileSize) => {
				set({
					map: { mapId, width, height, tileSize, entities: {}, mapScript: null },
					paintedTiles: [],
					selectedEntityIds: [],
					mapRelativePath: null,
					isDirty: false,
					zoom: 1,
					activeLayer: 'ground',
					selectedTilePositions: [],
					mapScript: null,
				});
			},

			loadMap: async (map) => {
				set({ isLoadingMap: true });

				try {
					const tiles: PaintedTile[] = [];
					const tileSize = map.tileSize;
					const usedTilesets = new Set<string>();

					Object.values(map.entities).forEach((entity) => {
						const positionComponent = entity.components.POSITION;
						const renderComponent = entity.components.RENDER;

						if (positionComponent && renderComponent) {
							const finalSpriteSheetPath = renderComponent.spriteSheetPath;

							if (finalSpriteSheetPath) usedTilesets.add(finalSpriteSheetPath);

							tiles.push({
								x: Math.floor(positionComponent.x / tileSize),
								y: Math.floor(positionComponent.y / tileSize),
								tilesetX: renderComponent.x / tileSize,
								tilesetY: renderComponent.y / tileSize,
								entityId: entity.id,
								layer: entity.layer,
								spriteSheetPath: finalSpriteSheetPath,
							});
						}
					});

					const currentProject = useProjectStore.getState().currentProject;
					const tileSetStore = useTileSetStore.getState();

					if (currentProject) {
						for (const path of usedTilesets) {
							if (tileSetStore.tilesets[path]) continue;
							try {
								const tilesetData = await loadSingleTileset(path, currentProject);
								if (tilesetData) tileSetStore.addTileSet(tilesetData);
								else console.warn(`No se pudo cargar: ${path}`);
							} catch (error) {
								console.error(`Error al auto-cargar ${path}:`, error);
							}
						}
					}

					set({
						map,
						paintedTiles: tiles,
						selectedEntityIds: [],
						isDirty: false,
						selectedTilePositions: [],
						mapScript: map.mapScript ?? null,
					});
				} finally {
					set({ isLoadingMap: false });
				}
			},

			addEntity: (entity) => {
				set((state) => {
					if (!state.map) return state;
					return {
						map: {
							...state.map,
							entities: { ...state.map.entities, [entity.id]: entity },
						},
					};
				});
			},

			removeEntity: (id) => {
				set((state) => {
					if (!state.map) return state;
					const { [id]: _, ...rest } = state.map.entities;
					return {
						map: { ...state.map, entities: rest },
						paintedTiles: state.paintedTiles.filter((tile) => tile.entityId !== id),
						selectedEntityIds: state.selectedEntityIds.filter((eid) => eid !== id),
						selectedTilePositions: state.selectedTilePositions.filter((pos) => {
							const tile = state.paintedTiles.find(
								(t) => t.x === pos.x && t.y === pos.y && t.layer === pos.layer
							);
							return tile?.entityId !== id;
						}),
					};
				});
			},

			updateEntity: (id, data) => {
				set((state) => {
					if (!state.map) return state;
					const entity = state.map.entities[id];
					if (!entity) return state;
					return {
						map: {
							...state.map,
							entities: { ...state.map.entities, [id]: { ...entity, ...data } },
						},
					};
				});
			},

			addComponent: (entityId, type, data) => {
				set((state) => {
					if (!state.map) return state;
					const entity = state.map.entities[entityId];
					if (!entity) return state;
					return {
						map: {
							...state.map,
							entities: {
								...state.map.entities,
								[entityId]: {
									...entity,
									components: { ...entity.components, [type]: data },
								},
							},
						},
					};
				});
			},

			updateComponent: (entityId, type, data) => {
				set((state) => {
					if (!state.map) return state;
					const entity = state.map.entities[entityId];
					const component = entity?.components[type];
					if (!entity || !component) return state;

					const updatedEntity = {
						...entity,
						components: {
							...entity.components,
							[type]: { ...component, ...data },
						},
					};

					let paintedTiles = state.paintedTiles;
					if (type === 'RENDER' && 'spriteSheetPath' in data) {
						const newPath = (data as { spriteSheetPath?: string }).spriteSheetPath;
						if (newPath !== undefined) {
							paintedTiles = paintedTiles.map((tile) =>
								tile.entityId === entityId ? { ...tile, spriteSheetPath: newPath } : tile
							);
						}
					}

					return {
						map: {
							...state.map,
							entities: { ...state.map.entities, [entityId]: updatedEntity },
						},
						paintedTiles,
					};
				});
			},

			updateComponentBatch: (entityIds, type, data) => {
				set((state) => {
					if (!state.map) return state;

					const updatedEntities = { ...state.map.entities };
					let paintedTiles = state.paintedTiles;
					let pathChanged = false;

					for (const entityId of entityIds) {
						const entity = updatedEntities[entityId];
						const component = entity?.components[type];
						if (!entity || !component) continue;

						updatedEntities[entityId] = {
							...entity,
							components: {
								...entity.components,
								[type]: { ...component, ...data },
							},
						};

						if (type === 'RENDER' && 'spriteSheetPath' in data) {
							pathChanged = true;
						}
					}

					if (pathChanged) {
						const newPath = (data as { spriteSheetPath?: string }).spriteSheetPath;
						if (newPath !== undefined) {
							const idSet = new Set(entityIds);
							paintedTiles = paintedTiles.map((tile) =>
								idSet.has(tile.entityId) ? { ...tile, spriteSheetPath: newPath } : tile
							);
						}
					}

					return {
						map: { ...state.map, entities: updatedEntities },
						paintedTiles,
						isDirty: true,
					};
				});
			},

			removeComponent: (entityId, type) => {
				set((state) => {
					if (!state.map) return state;
					const entity = state.map.entities[entityId];
					if (!entity) return state;
					const { [type]: _, ...rest } = entity.components;
					return {
						map: {
							...state.map,
							entities: {
								...state.map.entities,
								[entityId]: { ...entity, components: rest },
							},
						},
						isDirty: true,
					};
				});
			},

			clearPaintedTiles: () => set({ paintedTiles: [] }),

			clearMapTiles: () => {
				set((state) => {
					if (!state.map) return state;
					const tileEntityIds = Object.values(state.map.entities)
						.filter((entity) => entity.tag === 'TILEMAP')
						.map((entity) => entity.id);

					const newEntities = { ...state.map.entities };
					tileEntityIds.forEach((id) => delete newEntities[id]);

					return {
						map: { ...state.map, entities: newEntities },
						paintedTiles: [],
					};
				});
			},

			paintTiles: (tiles) => {
				set((state) => {
					if (!state.map) return state;

					const newEntities = { ...state.map.entities };
					const newPaintedTiles: PaintedTile[] = [];

					const tilesToRemove = state.paintedTiles.filter((existing) =>
						tiles.some(
							(nt) =>
								nt.mapX === existing.x && nt.mapY === existing.y && nt.layer === existing.layer
						)
					);

					tilesToRemove.forEach((tile) => delete newEntities[tile.entityId]);

					const filteredPaintedTiles = state.paintedTiles.filter(
						(existing) =>
							!tiles.some(
								(nt) =>
									nt.mapX === existing.x && nt.mapY === existing.y && nt.layer === existing.layer
							)
					);

					const tileSetStore = useTileSetStore.getState();

					tiles.forEach((tile) => {
						const currentTileSetData = tileSetStore.tilesets[tile.spriteSheetPath];
						const subImages = currentTileSetData?.subImages;

						const newEntity = createTileEntity(
							tile.entityId,
							tile.layer,
							tile.mapX,
							tile.mapY,
							tile.tilesetX,
							tile.tilesetY,
							tile.tileSize,
							tile.spriteSheetPath,
							state.map!.tileSize,
							subImages
						);

						newEntities[tile.entityId] = newEntity;

						newPaintedTiles.push({
							x: tile.mapX,
							y: tile.mapY,
							tilesetX: newEntity.components.RENDER!.x / tile.tileSize,
							tilesetY: newEntity.components.RENDER!.y / tile.tileSize,
							entityId: tile.entityId,
							layer: tile.layer,
							spriteSheetPath: newEntity.components.RENDER!.spriteSheetPath,
						});
					});

					return {
						map: { ...state.map, entities: newEntities },
						paintedTiles: [...filteredPaintedTiles, ...newPaintedTiles],
					};
				});
			},

			exportToEngineFormat: () => {
				const state = get();
				if (!state.map) return '{}';
				return JSON.stringify(
					{
						mapId: state.map.mapId,
						mapScript: state.map.mapScript ?? null,
						entities: Object.values(state.map.entities),
					},
					null,
					2
				);
			},
		}),

		{
			limit: 40,
			partialize: (state) => ({
				map: state.map,
				paintedTiles: state.paintedTiles,
			}),
			equality: (pastState, currentState) =>
				JSON.stringify(pastState) === JSON.stringify(currentState),
		}
	)
);
