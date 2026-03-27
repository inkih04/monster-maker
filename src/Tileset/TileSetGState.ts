import { create } from 'zustand';
import { TileSetSubImage } from '../../global/types/tileSetConfig';

export interface TileSetData {
	id: string;
	pathImg: string;
	relativePath: string;
	pathTileMapConfig: string;
	tileSizeX: number;
	tileSizeY: number;
	isLoaded: boolean;
	atlasWidth?: number;
	atlasHeight?: number;
	subImages?: TileSetSubImage[];
}

export interface TileSelection {
	startX: number;
	startY: number;
	endX: number;
	endY: number;
}

export interface TileSetStore {
	tilesets: Record<string, TileSetData>;
	currentTileSetPath: string | null;
	selectedArea: TileSelection | null;
	zoom: number;
	isTileSizeOpen: boolean;

	setSelectedArea: (area: TileSelection | null) => void;
	setZoom: (zoom: number) => void;
	setCurrentTileSet: (path: string) => void;
	addTileSet: (tilemap: TileSetData) => void;
	setTileSetLoaded: (path: string, loaded: boolean) => void;
	updateTileSet: (path: string, updates: Partial<TileSetData>) => void;
	removeTileSet: (path: string) => void;
	openTileSizeDialog: () => void;
	closeTileSizeDialog: () => void;
	reset: () => void;
}

export const useTileSetStore = create<TileSetStore>((set, get) => {
	return {
		tilesets: {},
		currentTileSetPath: null,
		selectedArea: null,
		zoom: 1,
		isTileSizeOpen: false,

		setSelectedArea: (area) => {
			set({ selectedArea: area });
		},

		reset: () => {
			set({
				tilesets: {} as Record<string, TileSetData>,
				currentTileSetPath: null,
				selectedArea: null,
				zoom: 1,
				isTileSizeOpen: false,
			});
		},

		setZoom: (zoom) => {
			set({ zoom });
		},

		openTileSizeDialog: () => {
			set({ isTileSizeOpen: true });
		},

		closeTileSizeDialog: () => {
			set({ isTileSizeOpen: false });
		},

		setCurrentTileSet: (path) => {
			const tilesets = get().tilesets;
			if (tilesets[path]) {
				set({ currentTileSetPath: path });
			} else {
				console.warn(`TileSet with "${path}" does not exist`);
			}
		},

		addTileSet: (tilemap) => {
			set((state) => ({
				tilesets: { ...state.tilesets, [tilemap.relativePath]: tilemap },
			}));
		},

		setTileSetLoaded: (path, loaded) => {
			set((state) => {
				const tileSet = state.tilesets[path];
				if (!tileSet) return state;

				return {
					tilesets: {
						...state.tilesets,
						[path]: { ...tileSet, isLoaded: loaded },
					},
				};
			});
		},

		updateTileSet: (path, updates) => {
			set((state) => {
				const tileSet = state.tilesets[path];
				if (!tileSet) {
					console.warn(`TileSet with path "${path}" does not exist`);
					return state;
				}

				return {
					tilesets: {
						...state.tilesets,
						[path]: { ...tileSet, ...updates },
					},
				};
			});
		},

		removeTileSet: (path) => {
			set((state) => {
				const { [path]: _, ...remainingTilesets } = state.tilesets;
				const isCurrent = state.currentTileSetPath === path;

				return {
					tilesets: remainingTilesets,
					currentTileSetPath: isCurrent ? null : state.currentTileSetPath,
					selectedArea: isCurrent ? null : state.selectedArea,
				};
			});
		},
	};
});
