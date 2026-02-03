import { create } from 'zustand';

export interface TileSetData {
  id: string;
  pathImg: string;
  pathTileMapConfig: string;
  tileSizeX: number;
  tileSizeY: number;
  isLoaded: boolean;
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

  setSelectedArea: (area: TileSelection | null) => void;
  setZoom: (zoom: number) => void;
  setCurrentTileSet: (path: string) => void;
  addTileSet: (tilemap: TileSetData) => void;
  setTileSetLoaded: (path: string, loaded: boolean) => void;
}

export const useTileSetStore = create<TileSetStore>((set, get) => {
  return {
    tilesets: {},
    currentTileSetPath: null,
    selectedArea: null,
    zoom: 1,

    setSelectedArea: (area) => {
      set({ selectedArea: area });
    },

    setZoom: (zoom) => {
      set({ zoom });
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
        tilesets: { ...state.tilesets, [tilemap.pathTileMapConfig]: tilemap },
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
  };
});