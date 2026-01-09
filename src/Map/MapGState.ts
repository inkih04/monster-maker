import { create } from 'zustand';
import { ComponentMap, ComponentType } from '../domain/ecs/componentMap';
import { Layer } from '../domain/ecs/layer';
import { Tag } from '../domain/ecs/tags';

export interface Entity {
	id: string;
	tag?: Tag;
	layer: Layer;
	components: Partial<ComponentMap>;
}

export interface MapData {
	mapId: string;
	width: number;
	height: number;
	tileSize: number;
	entities: Record<string, Entity>;
}

interface MapStore {
	map: MapData | null;
	selectedEntityId: string | null;
	zoom: number;
	activeLayer: Layer;

	setZoom: (zoom: number) => void;
	setActiveLayer: (layer: Layer) => void;
	createMap(mapId: string, width: number, height: number, tileSize: number): void;

	loadMap(map: MapData): void;

	addEntity(entity: Entity): void;
	removeEntity(id: string): void;
	updateEntity(id: string, data: Partial<Pick<Entity, 'tag' | 'layer'>>): void;

	addComponent<K extends ComponentType>(entityId: string, type: K, data: ComponentMap[K]): void;

	updateComponent<K extends ComponentType>(
		entityId: string,
		type: K,
		data: Partial<ComponentMap[K]>
	): void;

	removeComponent(entityId: string, type: ComponentType): void;

	selectEntity(id: string | null): void;
	exportToEngineFormat(): string;
}

export const useMapStore = create<MapStore>((set, get) => ({
	map: null,
	selectedEntityId: null,
	zoom: 1,
	activeLayer: 'ground',

	setActiveLayer: (layer) => {
		console.log(layer);

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
			selectedEntityId: null,
		});
	},

	loadMap: (map) => {
		set({ map, selectedEntityId: null });
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
				selectedEntityId: state.selectedEntityId === id ? null : state.selectedEntityId,
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
}));
