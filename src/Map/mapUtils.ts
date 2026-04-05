import Entity from '../domain/ecs/entity';
import { Layer } from '../domain/ecs/layer';
import { PaintedTile, SelectedTilePosition } from './MapGState';
import { TileSetData, TileSelection } from '../Tileset/TileSetGState';
import { ProjectData } from '../../global/types/projectData';
import { TileSetSubImage } from '../../global/types/tileSetConfig';

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
	mapTileSize: number;
	isLayerLocked?: boolean;
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
	isLayerLocked?: boolean;
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
	isLayerLocked?: boolean;
}

export function getSubImageForTile(
	tilesetX: number,
	tilesetY: number,
	tileSize: number,
	subImages?: TileSetSubImage[]
): { subImagePath: string | null; localX: number; localY: number } {
	if (!subImages || subImages.length === 0) {
		return { subImagePath: null, localX: tilesetX * tileSize, localY: tilesetY * tileSize };
	}

	const pixelX = tilesetX * tileSize;
	const pixelY = tilesetY * tileSize;

	for (const subImage of subImages) {
		const subImageEndX = subImage.atlasOffsetX + subImage.widthInTiles * tileSize;
		const subImageEndY = subImage.atlasOffsetY + subImage.heightInTiles * tileSize;

		if (
			pixelX >= subImage.atlasOffsetX &&
			pixelX < subImageEndX &&
			pixelY >= subImage.atlasOffsetY &&
			pixelY < subImageEndY
		) {
			const localX = pixelX - subImage.atlasOffsetX;
			const localY = pixelY - subImage.atlasOffsetY;
			return { subImagePath: subImage.file, localX, localY };
		}
	}

	return { subImagePath: null, localX: pixelX, localY: pixelY };
}

export const createTileEntity = (
	entityId: string,
	layer: Layer,
	mapX: number,
	mapY: number,
	tilesetX: number,
	tilesetY: number,
	tileSize: number,
	originalImagePath: string,
	mapSize: number,
	subImages?: TileSetSubImage[],
	name?: string
): Entity => {
	const { subImagePath, localX, localY } = getSubImageForTile(
		tilesetX,
		tilesetY,
		tileSize,
		subImages
	);

	let finalSpriteSheetPath = originalImagePath;

	if (subImagePath) {
		const lastSlash = Math.max(
			originalImagePath.lastIndexOf('/'),
			originalImagePath.lastIndexOf('\\')
		);
		const dir = lastSlash >= 0 ? originalImagePath.substring(0, lastSlash + 1) : '';

		const cleanDir = dir.replace(/\\/g, '/');
		const cleanSub = subImagePath.replace(/\\/g, '/');
		finalSpriteSheetPath = cleanDir + cleanSub;
	}

	return {
		id: entityId,
		tag: 'TILEMAP',
		layer,
		name,
		components: {
			POSITION: {
				x: mapX * mapSize,
				y: mapY * mapSize,
				rotation: 0,
			},
			RENDER: {
				spriteSheetPath: finalSpriteSheetPath,
				x: localX,
				y: localY,
				w: tileSize,
				h: tileSize,
				width: mapSize,
				height: mapSize,
				shader: 'default',
			},
		},
	};
};

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
				ctx.fillStyle = 'rgba(122, 156, 200, 0.25)';
				ctx.strokeStyle = 'rgba(174, 203, 238, 0.9)';
			} else {
				ctx.fillStyle = 'rgba(232, 85, 85, 0.25)';
				ctx.strokeStyle = 'rgba(244, 140, 140, 0.9)';
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
	mapTileSize,
	isLayerLocked = false,
}: DrawBrushPreviewParams): void {
	if (isActive || !currentTileSet || !previewPosition || !selectedArea) return;

	const currentTilesetImage = currentTileSetPath ? tilesetImages[currentTileSetPath] : null;
	if (!currentTilesetImage) return;

	const srcTileSize = currentTileSet.tileSizeX;
	const destTileSize = mapTileSize * zoom;

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
					x * srcTileSize,
					y * srcTileSize,
					srcTileSize,
					srcTileSize,
					(previewPosition.x + (x - minX)) * destTileSize,
					(previewPosition.y + (y - minY)) * destTileSize,
					destTileSize,
					destTileSize
				);
			}
		}

		if (isLayerLocked) {
			const w = (maxX - minX + 1) * destTileSize;
			const h = (maxY - minY + 1) * destTileSize;
			ctx.globalAlpha = 0.55;
			ctx.fillStyle = 'rgba(220, 30, 30, 0.6)';
			ctx.fillRect(previewPosition.x * destTileSize, previewPosition.y * destTileSize, w, h);
		}
	} else {
		ctx.drawImage(
			currentTilesetImage,
			0,
			0,
			srcTileSize,
			srcTileSize,
			previewPosition.x * destTileSize,
			previewPosition.y * destTileSize,
			destTileSize,
			destTileSize
		);

		if (isLayerLocked) {
			ctx.globalAlpha = 0.55;
			ctx.fillStyle = 'rgba(220, 30, 30, 0.6)';
			ctx.fillRect(
				previewPosition.x * destTileSize,
				previewPosition.y * destTileSize,
				destTileSize,
				destTileSize
			);
		}
	}

	ctx.globalAlpha = 1;
}

export function drawEraserPreview({
	ctx,
	previewPosition,
	isActive,
	paintedTiles,
	activeLayer,
	tilesetImages,
	zoom,
	entities,
	isLayerLocked = false,
}: Omit<DrawEraserPreviewParams, 'tileSize' | 'tileSets'>): void {
	if (isActive || !previewPosition) return;

	const tileUnderCursor = paintedTiles.find(
		(tile) =>
			tile.x === previewPosition.x && tile.y === previewPosition.y && tile.layer === activeLayer
	);

	if (!tileUnderCursor) return;

	const entityData = entities[tileUnderCursor.entityId];
	const renderComponent = entityData?.components.RENDER;
	if (!renderComponent) return;

	const finalPath = renderComponent.spriteSheetPath;
	const subImageElement = tilesetImages[finalPath];

	if (!subImageElement) return;

	const sourceX = renderComponent.x;
	const sourceY = renderComponent.y;
	const sourceWidth = renderComponent.w;
	const sourceHeight = renderComponent.h;

	const destWidth = renderComponent.width * zoom;
	const destHeight = renderComponent.height * zoom;

	const posX = Math.floor(tileUnderCursor.x) * renderComponent.width * zoom;
	const posY = Math.floor(tileUnderCursor.y) * renderComponent.height * zoom;

	ctx.globalAlpha = 0.5;
	ctx.drawImage(
		subImageElement,
		sourceX,
		sourceY,
		sourceWidth,
		sourceHeight,
		posX,
		posY,
		destWidth,
		destHeight
	);

	ctx.fillStyle = isLayerLocked ? 'rgba(255, 140, 0, 0.6)' : 'rgba(255, 50, 50, 0.4)';
	ctx.fillRect(posX, posY, destWidth, destHeight);

	ctx.globalAlpha = 1;
}

export function drawSelectionPreview({
	ctx,
	previewPosition,
	isActive,
	paintedTiles,
	activeLayer,
	tilesetImages,
	zoom,
	entities,
	isLayerLocked = false,
}: Omit<DrawSelectionPreviewParams, 'tileSize' | 'tileSets'>): void {
	if (isActive || !previewPosition) return;

	const tileUnderCursor = paintedTiles.find(
		(tile) =>
			tile.x === previewPosition.x && tile.y === previewPosition.y && tile.layer === activeLayer
	);

	if (!tileUnderCursor) return;

	const entityData = entities[tileUnderCursor.entityId];
	const renderComponent = entityData?.components.RENDER;
	if (!renderComponent) return;

	const finalPath = renderComponent.spriteSheetPath;
	const subImageElement = tilesetImages[finalPath];

	if (!subImageElement) return;

	const sourceX = renderComponent.x;
	const sourceY = renderComponent.y;
	const sourceWidth = renderComponent.w;
	const sourceHeight = renderComponent.h;

	const destWidth = renderComponent.width * zoom;
	const destHeight = renderComponent.height * zoom;

	const posX = Math.floor(tileUnderCursor.x) * renderComponent.width * zoom;
	const posY = Math.floor(tileUnderCursor.y) * renderComponent.height * zoom;

	ctx.globalAlpha = 0.5;
	ctx.drawImage(
		subImageElement,
		sourceX,
		sourceY,
		sourceWidth,
		sourceHeight,
		posX,
		posY,
		destWidth,
		destHeight
	);

	ctx.fillStyle = isLayerLocked ? 'rgba(220, 30, 30, 0.6)' : 'rgba(0, 255, 0, 0.3)';
	ctx.fillRect(posX, posY, destWidth, destHeight);

	ctx.globalAlpha = 1;
}

interface DrawSelectionOverlayParams {
	ctx: CanvasRenderingContext2D;
	selectedTilePositions: SelectedTilePosition[];
	tileSize: number;
	zoom: number;
}

export function drawSelectionOverlay({
	ctx,
	selectedTilePositions,
	tileSize,
	zoom,
}: DrawSelectionOverlayParams): void {
	if (!selectedTilePositions || selectedTilePositions.length === 0) return;

	const scaledTileSize = tileSize * zoom;

	selectedTilePositions.forEach((pos, index) => {
		const x = pos.x * scaledTileSize;
		const y = pos.y * scaledTileSize;

		ctx.fillStyle = index === 0 ? 'rgba(0, 255, 0, 0.45)' : 'rgba(0, 200, 255, 0.35)';
		ctx.fillRect(x, y, scaledTileSize, scaledTileSize);

		ctx.strokeStyle = index === 0 ? 'rgba(0, 255, 80, 0.9)' : 'rgba(0, 180, 255, 0.8)';
		ctx.lineWidth = 1.5;
		ctx.strokeRect(x + 0.75, y + 0.75, scaledTileSize - 1.5, scaledTileSize - 1.5);
	});
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

		const result = await window.api.getFile(jsonPath, '', currentProject);
		let config = {};
		if (result.success && result.content?.content) {
			try {
				config = JSON.parse(result.content.content);
			} catch (e) {
				console.error('Error parsing config on loadSingleTileset', e);
			}
		}

		const newTileSet: TileSetData = {
			id: crypto.randomUUID(),
			pathImg: completePath,
			pathTileMapConfig: jsonPath,
			relativePath: spriteSheetPath,
			tileSizeX: currentProject?.defaultTilesize || 16,
			tileSizeY: currentProject?.defaultTilesize || 16,
			isLoaded: true,
			...config,
		};

		return newTileSet;
	} catch (error) {
		console.error(`Error loading tileset ${spriteSheetPath}:`, error);
		return null;
	}
}
