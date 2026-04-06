export interface TileSetSubImage {
	file: string;
	atlasOffsetX: number;
	atlasOffsetY: number;
	widthInTiles: number;
	heightInTiles: number;
}

export interface TileSetConfig {
	tileSizeX: number;
	tileSizeY: number;
	atlasWidth?: number;
	atlasHeight?: number;
	subImages?: TileSetSubImage[];
}
