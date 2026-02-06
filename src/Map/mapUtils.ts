import Entity from '../domain/ecs/entity';
import { Layer } from '../domain/ecs/layer';
import { PaintedTile } from './MapGState';
import { TileSetData, TileSelection } from '../Tileset/TileSetGState';

interface PreviewPosition {
	x: number;
	y: number;
}

interface DrawBrushPreviewParams {
	ctx: CanvasRenderingContext2D;
	previewPosition: PreviewPosition;
	isActive: boolean;
	currentTileSet: TileSetData | undefined;
	currentTileSetPath: string | null;
	tilesetImages: Record<string, HTMLImageElement>;
	selectedArea: TileSelection | null;
	zoom: number;
}

interface DrawEraserPreviewParams {
	ctx: CanvasRenderingContext2D;
	previewPosition: PreviewPosition;
	isActive: boolean;
	paintedTiles: PaintedTile[];
	activeLayer: Layer;
	tileSets: Record<string, TileSetData>;
	tilesetImages: Record<string, HTMLImageElement>;
	zoom: number;
}

export const createTileEntity = (
	entityId: string,
	layer: Layer,
	mapX: number,
	mapY: number,
	tilesetX: number,
	tilesetY: number,
	tileSize: number,
	spriteSheetPath: string
): Entity => ({
	id: entityId,
	tag: 'TILEMAP',
	layer,
	components: {
		POSITION: {
			x: mapX * tileSize,
			y: mapY * tileSize,
			rotation: 0,
		},
		RENDER: {
			spriteSheetPath,
			x: tilesetX * tileSize,
			y: tilesetY * tileSize,
			w: tileSize,
			h: tileSize,
			width: tileSize,
			height: tileSize,
		},
	},
});

export function drawBrushPreview({
	ctx,
	previewPosition,
	isActive,
	currentTileSet,
	currentTileSetPath,
	tilesetImages,
	selectedArea,
	zoom,
}: DrawBrushPreviewParams): void {
	if (isActive || !currentTileSet || !previewPosition) return;

	const currentTilesetImage = currentTileSetPath ? tilesetImages[currentTileSetPath] : null;
	if (!currentTilesetImage) return;

	const tileSize = currentTileSet.tileSizeX;
	const scaledTileSize = tileSize * zoom;

	ctx.globalAlpha = 0.5;

	if (selectedArea) {
		const minX = Math.min(selectedArea.startX, selectedArea.endX);
		const maxX = Math.max(selectedArea.startX, selectedArea.endX);
		const minY = Math.min(selectedArea.startY, selectedArea.endY);
		const maxY = Math.max(selectedArea.startY, selectedArea.endY);

		for (let y = minY; y <= maxY; y++) {
			for (let x = minX; x <= maxX; x++) {
				ctx.drawImage(
					currentTilesetImage,
					x * tileSize,
					y * tileSize,
					tileSize,
					tileSize,
					(previewPosition.x + (x - minX)) * scaledTileSize,
					(previewPosition.y + (y - minY)) * scaledTileSize,
					scaledTileSize,
					scaledTileSize
				);
			}
		}
	} else {
		ctx.drawImage(
			currentTilesetImage,
			0,
			0,
			tileSize,
			tileSize,
			previewPosition.x * scaledTileSize,
			previewPosition.y * scaledTileSize,
			scaledTileSize,
			scaledTileSize
		);
	}

	ctx.globalAlpha = 1;
}

export function drawEraserPreview({
	ctx,
	previewPosition,
	isActive,
	paintedTiles,
	activeLayer,
	tileSets,
	tilesetImages,
	zoom,
}: DrawEraserPreviewParams): void {
	if (isActive || !previewPosition) return;

	const tileUnderCursor = paintedTiles.find(
		(tile) =>
			tile.x === previewPosition.x && tile.y === previewPosition.y && tile.layer === activeLayer
	);

	if (!tileUnderCursor) return;

	const tileTileset = tileSets[tileUnderCursor.spriteSheetPath];
	const tilesetImage = tilesetImages[tileUnderCursor.spriteSheetPath];

	if (!tileTileset || !tilesetImage || !tileTileset.isLoaded) return;

	const tileTileSize = tileTileset.tileSizeX;
	const scaledTileSize = tileTileSize * zoom;

	ctx.globalAlpha = 0.5;
	ctx.drawImage(
		tilesetImage,
		tileUnderCursor.tilesetX * tileTileSize,
		tileUnderCursor.tilesetY * tileTileSize,
		tileTileSize,
		tileTileSize,
		tileUnderCursor.x * scaledTileSize,
		tileUnderCursor.y * scaledTileSize,
		scaledTileSize,
		scaledTileSize
	);

	ctx.fillStyle = 'rgba(255, 50, 50, 0.4)'; 
	ctx.fillRect(
		tileUnderCursor.x * scaledTileSize,
		tileUnderCursor.y * scaledTileSize,
		scaledTileSize,
		scaledTileSize
	);

	ctx.globalAlpha = 1;
}
