import { create } from 'zustand';

interface TileMapData {
	id: string;
	pathImg: string;
	pathTileMapConfig: string;
	tileSizeX: number;
	tileSizeY: number;
	isLoaded: boolean;
}

interface TileSelection {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
}

interface TileMapStore {
	tilemaps: TileMapData[];
	currentTileMapId: string | null;
    selectedArea: TileSelection | null;
    zoom: number;

    setSelectedArea: (area: TileSelection | null) => void;
    setZoom: (zoom: number) => void;
    setCurrentTileMap: (id: string) => void;
    addTileMap: (tilemap: TileMapData) => void;
    setTileMapLoaded: (id: string, loaded: boolean) => void;

}

export const useTileMapStore = create<TileMapStore>((set, get) => {
return {
        tilemaps: [
            {
                id: 'tilemap-1',
                pathImg: '../../engine/resources/maps/tilesets/TileMap2.png',
                pathTileMapConfig: '../../engine/resources/maps/tilesets/TileMap2.json',
                tileSizeX: 16,
                tileSizeY: 16,
                isLoaded: false
            }
        ],
        currentTileMapId: 'tilemap-1', 
        selectedArea: null,
        zoom: 1,

        
        setSelectedArea: (area) => {
            set({ selectedArea: area });
        },

        setZoom: (zoom) => {
            set({ zoom });
        },

        setCurrentTileMap: (id) => {
            const exists = get().tilemaps.some(tm => tm.id === id);
            if (exists) {
                set({ currentTileMapId: id });
            } else {
                console.warn(`TileMap con id "${id}" no existe`);
            }
        },

        addTileMap: (tilemap) => {
            set((state) => ({
                tilemaps: [...state.tilemaps, tilemap]
            }));
        },

        setTileMapLoaded: (id, loaded) => {
            set((state) => ({
                tilemaps: state.tilemaps.map(tm =>
                    tm.id === id ? { ...tm, isLoaded: loaded } : tm
                )
            }));
        }
    };
})