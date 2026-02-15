import Entity from '../domain/ecs/entity';
import { Layer } from '../domain/ecs/layer';
import { PaintedTile, SelectedTilePosition } from './MapGState';
import { TileSetData, TileSelection } from '../Tileset/TileSetGState';
import { ProjectData } from '../../global/types/projectData';

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

interface DrawCollisionDebugParams {
	ctx: CanvasRenderingContext2D;
	entities: Record<string, Entity>;
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
	tileSize: number;
	zoom: number;
	entities: Record<string, Entity>;
}

interface DrawSelectionPreviewParams {
	ctx: CanvasRenderingContext2D;
	previewPosition: PreviewPosition;
	isActive: boolean;
	paintedTiles: PaintedTile[];
	activeLayer: Layer;
	tileSets: Record<string, TileSetData>;
	tilesetImages: Record<string, HTMLImageElement>;
	tileSize: number;
	zoom: number;
	entities: Record<string, Entity>;
}

export const createTileEntity = (
	entityId: string,
	layer: Layer,
	mapX: number,
	mapY: number,
	tilesetX: number,
	tilesetY: number,
	tileSize: number,
	spriteSheetPath: string,
	name?: string
): Entity => ({
	id: entityId,
	tag: 'TILEMAP',
	layer,
	name,
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

export function drawCollisionDebug({ ctx, entities, zoom }: DrawCollisionDebugParams): void {
	Object.values(entities).forEach((entity) => {
		const collider = entity.components.COLLIDER;
		const position = entity.components.POSITION;

		if (collider && position) {
			const offX = collider.offsetX ?? 0;
			const offY = collider.offsetY ?? 0;

			const x = (position.x + offX) * zoom;
			const y = (position.y + offY) * zoom;

			const w = collider.width * zoom;
			const h = collider.height * zoom;

			ctx.save();

			if (collider.isTrigger) {
				ctx.fillStyle = 'rgba(255, 165, 0, 0.3)';
				ctx.strokeStyle = 'rgba(255, 165, 0, 0.9)';
			} else {
				ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
				ctx.strokeStyle = 'rgba(255, 255, 0, 0.9)';
			}

			ctx.lineWidth = 1;
			ctx.fillRect(x, y, w, h);
			ctx.strokeRect(x, y, w, h);

			ctx.restore();
		}
	});
}

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
	tileSize,
	zoom,
	entities,
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

	const entityData = entities[tileUnderCursor.entityId];
	const renderComponent = entityData?.components.RENDER;

	if (!renderComponent) return;

	const sourceX = renderComponent.x;
	const sourceY = renderComponent.y;
	const sourceWidth = renderComponent.w;
	const sourceHeight = renderComponent.h;

	const destWidth = renderComponent.width * zoom;
	const destHeight = renderComponent.height * zoom;

	const posX = Math.floor(tileUnderCursor.x) * tileSize * zoom;
	const posY = Math.floor(tileUnderCursor.y) * tileSize * zoom;

	ctx.globalAlpha = 0.5;
	ctx.drawImage(
		tilesetImage,
		sourceX,
		sourceY,
		sourceWidth,
		sourceHeight,
		posX,
		posY,
		destWidth,
		destHeight
	);

	ctx.fillStyle = 'rgba(255, 50, 50, 0.4)';
	ctx.fillRect(posX, posY, destWidth, destHeight);

	ctx.globalAlpha = 1;
}

export function drawSelectionPreview({
	ctx,
	previewPosition,
	isActive,
	paintedTiles,
	activeLayer,
	tileSets,
	tilesetImages,
	tileSize,
	zoom,
	entities,
}: DrawSelectionPreviewParams): void {
	if (isActive || !previewPosition) return;

	const tileUnderCursor = paintedTiles.find(
		(tile) =>
			tile.x === previewPosition.x && tile.y === previewPosition.y && tile.layer === activeLayer
	);

	if (!tileUnderCursor) return;

	const tileTileset = tileSets[tileUnderCursor.spriteSheetPath];
	const tilesetImage = tilesetImages[tileUnderCursor.spriteSheetPath];

	if (!tileTileset || !tilesetImage || !tileTileset.isLoaded) return;

	const entityData = entities[tileUnderCursor.entityId];
	const renderComponent = entityData?.components.RENDER;

	if (!renderComponent) return;

	const sourceX = renderComponent.x;
	const sourceY = renderComponent.y;
	const sourceWidth = renderComponent.w;
	const sourceHeight = renderComponent.h;

	const destWidth = renderComponent.width * zoom;
	const destHeight = renderComponent.height * zoom;

	const posX = Math.floor(tileUnderCursor.x) * tileSize * zoom;
	const posY = Math.floor(tileUnderCursor.y) * tileSize * zoom;

	ctx.globalAlpha = 0.5;
	ctx.drawImage(
		tilesetImage,
		sourceX,
		sourceY,
		sourceWidth,
		sourceHeight,
		posX,
		posY,
		destWidth,
		destHeight
	);

	ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
	ctx.fillRect(posX, posY, destWidth, destHeight);

	ctx.globalAlpha = 1;
}

interface DrawSelectionOverlayParams {
	ctx: CanvasRenderingContext2D;
	selectedTilePosition: SelectedTilePosition | null;
	tileSize: number;
	zoom: number;
}

export function drawSelectionOverlay({
	ctx,
	selectedTilePosition,
	tileSize,
	zoom,
}: DrawSelectionOverlayParams): void {
	if (!selectedTilePosition) return;

	const scaledTileSize = tileSize * zoom;
	const x = selectedTilePosition.x * scaledTileSize;
	const y = selectedTilePosition.y * scaledTileSize;

	ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
	ctx.fillRect(x, y, scaledTileSize, scaledTileSize);
}

export async function loadSingleTileset(
	spriteSheetPath: string,
	currentProject: ProjectData
): Promise<TileSetData | null> {
	try {
		const lastSlashIndex = Math.max(
			spriteSheetPath.lastIndexOf('/'),
			spriteSheetPath.lastIndexOf('\\')
		);
		const directory = spriteSheetPath.substring(0, lastSlashIndex + 1);
		const fileName = spriteSheetPath.substring(lastSlashIndex + 1);

		const hiddenJsonName = '.' + fileName.replace(/\.[^/.]+$/, '.json');
		const jsonPath = await window.api.pathUnion(directory, hiddenJsonName);

		const fullProjectPath = await window.api.pathUnion(currentProject.path, currentProject.name);
		const completePath = await window.api.pathUnion(fullProjectPath, spriteSheetPath);
		console.log(spriteSheetPath);

		const newTileSet: TileSetData = {
			id: crypto.randomUUID(),
			pathImg: completePath,
			pathTileMapConfig: jsonPath,
			relativePath: spriteSheetPath,
			tileSizeX: currentProject?.defaultTilesize || 16,
			tileSizeY: currentProject?.defaultTilesize || 16,
			isLoaded: true,
		};

		return newTileSet;
	} catch (error) {
		console.error(`Error loading tileset ${spriteSheetPath}:`, error);
		return null;
	}
}
