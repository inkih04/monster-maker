import { useState, useCallback } from 'react';
import { useMapStore } from '../../Map/MapGState';
import { useTileSetStore } from '../../Tileset/TileSetGState';
import { Layer } from '../../domain/ecs/layer';

export interface PaintedTile {
	x: number;
	y: number;
	tilesetX: number;
	tilesetY: number;
	entityId: string;
}

interface PreviewPosition {
	x: number;
	y: number;
}

interface UseTilePainterResult {
	paintedTiles: PaintedTile[];
	isDrawing: boolean;
	previewPosition: PreviewPosition | null;
	setIsDrawing: (value: boolean) => void;
	setPreviewPosition: (pos: PreviewPosition | null) => void;
	paintTile: (tileX: number, tileY: number) => void;
	clearMap: () => void;
}

export function useTilePainter(): UseTilePainterResult {
	const activeLayer = useMapStore((state) => state.activeLayer);
	const addEntity = useMapStore((state) => state.addEntity);
	const removeEntity = useMapStore((state) => state.removeEntity);
	const addComponent = useMapStore((state) => state.addComponent);

	const tileSets = useTileSetStore((state) => state.tilemaps);
	const currentTileSetId = useTileSetStore((state) => state.currentTileMapId);
	const selectedArea = useTileSetStore((state) => state.selectedArea);

	const currentTileSet = tileSets.find((tm) => tm.id === currentTileSetId);

	const [paintedTiles, setPaintedTiles] = useState<PaintedTile[]>([]);
	const [isDrawing, setIsDrawing] = useState(false);
	const [previewPosition, setPreviewPosition] = useState<PreviewPosition | null>(null);

	const generateEntityId = (): string => {
		return `tile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	};

	const paintTile = useCallback(
		(tileX: number, tileY: number) => {
			if (!currentTileSet || !currentTileSet.pathImg) return;

			const tileSize = currentTileSet.tileSizeX;
			const newTiles: PaintedTile[] = [];

			if (selectedArea) {
				const minTilesetX = Math.min(selectedArea.startX, selectedArea.endX);
				const maxTilesetX = Math.max(selectedArea.startX, selectedArea.endX);
				const minTilesetY = Math.min(selectedArea.startY, selectedArea.endY);
				const maxTilesetY = Math.max(selectedArea.startY, selectedArea.endY);

				for (let tilesetY = minTilesetY; tilesetY <= maxTilesetY; tilesetY++) {
					for (let tilesetX = minTilesetX; tilesetX <= maxTilesetX; tilesetX++) {
						const offsetX = tilesetX - minTilesetX;
						const offsetY = tilesetY - minTilesetY;

						const mapX = tileX + offsetX;
						const mapY = tileY + offsetY;

						const entityId = generateEntityId();

						newTiles.push({
							x: mapX,
							y: mapY,
							tilesetX,
							tilesetY,
							entityId,
						});

						addEntity({
							id: entityId,
							tag: 'TILEMAP',
							layer: activeLayer,
							components: {},
						});

						addComponent(entityId, 'POSITION', {
							x: mapX * tileSize,
							y: mapY * tileSize,
							rotation: 0,
						});

						addComponent(entityId, 'RENDER', {
							spriteSheetPath: currentTileSet.pathImg,
							x: tilesetX * tileSize,
							y: tilesetY * tileSize,
							w: tileSize,
							h: tileSize,
							width: tileSize,
							height: tileSize,
						});
					}
				}
			} else {
				const entityId = generateEntityId();

				newTiles.push({
					x: tileX,
					y: tileY,
					tilesetX: 0,
					tilesetY: 0,
					entityId,
				});

				addEntity({
					id: entityId,
					tag: 'TILEMAP',
					layer: activeLayer,
					components: {},
				});

				addComponent(entityId, 'POSITION', {
					x: tileX * tileSize,
					y: tileY * tileSize,
					rotation: 0,
				});

				addComponent(entityId, 'RENDER', {
					spriteSheetPath: currentTileSet.pathImg,
					x: 0,
					y: 0,
					w: tileSize,
					h: tileSize,
					width: tileSize,
					height: tileSize,
				});
			}

			setPaintedTiles((prev) => {
				const tilesToRemove = prev.filter((existing) =>
					newTiles.some((nt) => nt.x === existing.x && nt.y === existing.y)
				);

				tilesToRemove.forEach((tile) => removeEntity(tile.entityId));

				const filtered = prev.filter(
					(existing) => !newTiles.some((nt) => nt.x === existing.x && nt.y === existing.y)
				);

				return [...filtered, ...newTiles];
			});
		},
		[activeLayer, addComponent, addEntity, currentTileSet, removeEntity, selectedArea]
	);

	const clearMap = useCallback(() => {
		paintedTiles.forEach((tile) => removeEntity(tile.entityId));
		setPaintedTiles([]);
	}, [paintedTiles, removeEntity]);

	return {
		paintedTiles,
		isDrawing,
		previewPosition,
		setIsDrawing,
		setPreviewPosition,
		paintTile,
		clearMap,
	};
}
