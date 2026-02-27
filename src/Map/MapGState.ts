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
}

export interface SelectedTilePosition {
	x: number;
	y: number;
	layer: Layer;
}

interface MapStore {
	map: MapData | null;
	paintedTiles: PaintedTile[];
	selectedEntityId: string | null;
	mapRelativePath: string | null;
	zoom: number;
	activeLayer: Layer;
	isDirty: boolean;
	selectedTilePosition: SelectedTilePosition | null;
	isLoadingMap: boolean;
	showCollisions: boolean;

	setShowCollisions: (show: boolean) => void;
	toggleShowCollisions: () => void;

	setSelectedTilePosition: (position: SelectedTilePosition | null) => void;
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

export const useMapStore = create<MapStore>()(
	temporal(
		(set, get) => ({
			map: {
				mapId: '1',
				width: 100,
				height: 100,
				tileSize: 16,
				entities: {},
			},
			mapRelativePath: null,
			paintedTiles: [],
			isDirty: false,
			selectedEntityId: null,
			selectedTilePosition: null,
			zoom: 1,
			activeLayer: 'ground',
			isLoadingMap: false,
			showCollisions: false,

			reset: () => {
				set({
					map: {
						mapId: '1',
						width: 100,
						height: 100,
						tileSize: 16,
						entities: {},
					},
					mapRelativePath: null,
					paintedTiles: [],
					isDirty: false,
					selectedEntityId: null,
					selectedTilePosition: null,
					zoom: 1,
					activeLayer: 'ground' as Layer,
					isLoadingMap: false,
					showCollisions: false,
				});
				useMapStore.temporal.getState().clear();
			},

			setShowCollisions: (show) => {
				set({ showCollisions: show });
			},

			toggleShowCollisions: () => {
				set((state) => ({ showCollisions: !state.showCollisions }));
			},

			setMapRelativePath: (relativePath: string) => {
				set({ mapRelativePath: relativePath });
			},

			setSelectedTilePosition: (position) => {
				set({ selectedTilePosition: position });
			},

			setIsLoadingMap: (loading) => {
				set({ isLoadingMap: loading });
			},

			setIsDirty: (isDirty) => {
				set({ isDirty });
			},

			setActiveLayer: (layer) => {
				set({ activeLayer: layer });
			},

			setZoom: (zoom) => {
				set({ zoom });
			},

			createMap: (mapId, width, height, tileSize) => {
				set({
					map: {
						mapId,
						width,
						height,
						tileSize,
						entities: {},
					},
					paintedTiles: [],
					selectedEntityId: null,
					mapRelativePath: null,
					isDirty: false,
					zoom: 1,
					activeLayer: 'ground',
					selectedTilePosition: null,
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
							const spriteSheetPath = renderComponent.spriteSheetPath;
							if (spriteSheetPath) {
								usedTilesets.add(spriteSheetPath);
							}

							tiles.push({
								x: Math.floor(positionComponent.x / tileSize),
								y: Math.floor(positionComponent.y / tileSize),
								tilesetX: renderComponent.x / tileSize,
								tilesetY: renderComponent.y / tileSize,
								entityId: entity.id,
								layer: entity.layer,
								spriteSheetPath: renderComponent.spriteSheetPath || '',
							});
						}
					});

					console.log('Tilesets detectados:', Array.from(usedTilesets));

					const currentProject = useProjectStore.getState().currentProject;
					const tileSetStore = useTileSetStore.getState();

					if (!currentProject) {
						return;
					}

					for (const spriteSheetPath of usedTilesets) {
						if (tileSetStore.tilesets[spriteSheetPath]) {
							console.log(`Tileset already loaded: ${spriteSheetPath}`);
							continue;
						}
						try {
							const tilesetData = await loadSingleTileset(spriteSheetPath, currentProject);

							if (tilesetData) {
								tileSetStore.addTileSet(tilesetData);
								console.log(`Tileset auto-loaded: ${spriteSheetPath}`);
							} else {
								console.warn(`Tilset couldn't be onpen: ${spriteSheetPath}`);
							}
						} catch (error) {
							console.error(`Error while loading tileset ${spriteSheetPath}:`, error);
						}
					}
					set({
						map,
						paintedTiles: tiles,
						selectedEntityId: null,
						isDirty: false,
						selectedTilePosition: null,
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
							entities: {
								...state.map.entities,
								[entity.id]: entity,
							},
						},
					};
				});
			},

			removeEntity: (id) => {
				set((state) => {
					if (!state.map) return state;

					const { [id]: _, ...rest } = state.map.entities;

					return {
						map: {
							...state.map,
							entities: rest,
						},
						paintedTiles: state.paintedTiles.filter((tile) => tile.entityId !== id),
						selectedEntityId: state.selectedEntityId === id ? null : state.selectedEntityId,
						selectedTilePosition: state.selectedEntityId === id ? null : state.selectedTilePosition,
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
							entities: {
								...state.map.entities,
								[id]: {
									...entity,
									...data,
								},
							},
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
									components: {
										...entity.components,
										[type]: data,
									},
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

					return {
						map: {
							...state.map,
							entities: {
								...state.map.entities,
								[entityId]: {
									...entity,
									components: {
										...entity.components,
										[type]: {
											...component,
											...data,
										},
									},
								},
							},
						},
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
								[entityId]: {
									...entity,
									components: rest,
								},
							},
						},
					};
				});
			},

			selectEntity: (id) => {
				set({ selectedEntityId: id });
			},

			clearPaintedTiles: () => {
				set({ paintedTiles: [] });
			},

			clearMapTiles: () => {
				set((state) => {
					if (!state.map) return state;

					const tileEntityIds = Object.values(state.map.entities)
						.filter((entity) => entity.tag === 'TILEMAP')
						.map((entity) => entity.id);

					const newEntities = { ...state.map.entities };
					tileEntityIds.forEach((id) => {
						delete newEntities[id];
					});

					return {
						map: {
							...state.map,
							entities: newEntities,
						},
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

					tilesToRemove.forEach((tile) => {
						delete newEntities[tile.entityId];
					});

					const filteredPaintedTiles = state.paintedTiles.filter(
						(existing) =>
							!tiles.some(
								(nt) =>
									nt.mapX === existing.x && nt.mapY === existing.y && nt.layer === existing.layer
							)
					);

					tiles.forEach((tile) => {
						newEntities[tile.entityId] = createTileEntity(
							tile.entityId,
							tile.layer,
							tile.mapX,
							tile.mapY,
							tile.tilesetX,
							tile.tilesetY,
							tile.tileSize,
							tile.spriteSheetPath
						);

						newPaintedTiles.push({
							x: tile.mapX,
							y: tile.mapY,
							tilesetX: tile.tilesetX,
							tilesetY: tile.tilesetY,
							entityId: tile.entityId,
							layer: tile.layer,
							spriteSheetPath: tile.spriteSheetPath,
						});
					});

					return {
						map: {
							...state.map,
							entities: newEntities,
						},
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
			equality: (pastState, currentState) => {
				return JSON.stringify(pastState) === JSON.stringify(currentState);
			},
		}
	)
);
