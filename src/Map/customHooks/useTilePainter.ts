import { useState, useCallback } from 'react';
import { useMapStore } from '../../Map/MapGState';
import { useTileSetStore } from '../../Tileset/TileSetGState';
import { Layer } from '../../domain/ecs/layer';

interface PreviewPosition {
	x: number;
	y: number;
}

interface UseTilePainterResult {
	isDrawing: boolean;
	previewPosition: PreviewPosition | null;
	setIsDrawing: (value: boolean) => void;
	setPreviewPosition: (pos: PreviewPosition | null) => void;
	paintTile: (tileX: number, tileY: number) => void;
	clearMap: () => void;
}

export function useTilePainter(): UseTilePainterResult {
	const activeLayer = useMapStore((state) => state.activeLayer);
	const paintTiles = useMapStore((state) => state.paintTiles);
	const clearMapTiles = useMapStore((state) => state.clearMapTiles);
	const setIsDirty = useMapStore((state) => state.setIsDirty);

	const tileSets = useTileSetStore((state) => state.tilesets);
	const currentTileSetPath = useTileSetStore((state) => state.currentTileSetPath);
	const selectedArea = useTileSetStore((state) => state.selectedArea);

	const currentTileSet = tileSets[currentTileSetPath || ''];

	const [isDrawing, setIsDrawing] = useState(false);
	const [previewPosition, setPreviewPosition] = useState<PreviewPosition | null>(null);

	const generateEntityId = (): string => {
		return `tile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	};

	const paintTile = useCallback(
		(tileX: number, tileY: number) => {
			if (!currentTileSet || !currentTileSet.pathImg) return;

			const tileSize = currentTileSet.tileSizeX;
			const tilesToPaint: Array<{
				mapX: number;
				mapY: number;
				tilesetX: number;
				tilesetY: number;
				entityId: string;
				layer: Layer;
				tileSize: number;
				spriteSheetPath: string;
			}> = [];

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

						tilesToPaint.push({
							mapX,
							mapY,
							tilesetX,
							tilesetY,
							entityId: generateEntityId(),
							layer: activeLayer,
							tileSize,
							spriteSheetPath: currentTileSet.pathImg,
						});
					}
				}
			} else {
				tilesToPaint.push({
					mapX: tileX,
					mapY: tileY,
					tilesetX: 0,
					tilesetY: 0,
					entityId: generateEntityId(),
					layer: activeLayer,
					tileSize,
					spriteSheetPath: currentTileSet.pathImg,
				});
			}

			setIsDirty(true);
			paintTiles(tilesToPaint);
		},
		[activeLayer, currentTileSet, paintTiles, selectedArea, setIsDirty]
	);

	const clearMap = useCallback(() => {
		clearMapTiles();
	}, [clearMapTiles]);

	return {
		isDrawing,
		previewPosition,
		setIsDrawing,
		setPreviewPosition,
		paintTile,
		clearMap,
	};
}
