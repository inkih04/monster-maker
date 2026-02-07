import { useState, useCallback } from 'react';
import { useMapStore } from '../../Map/MapGState';

interface PreviewPosition {
	x: number;
	y: number;
}

interface UseSelectToolResult {
	isActive: boolean;
	previewPosition: PreviewPosition | null;
	setIsActive: (value: boolean) => void;
	setPreviewPosition: (pos: PreviewPosition | null) => void;
	onTileClick: (tileX: number, tileY: number) => void;
	onTileDrag: (tileX: number, tileY: number) => void;
}

export function useSelectTool(): UseSelectToolResult {
	const activeLayer = useMapStore((state) => state.activeLayer);
	const paintedTiles = useMapStore((state) => state.paintedTiles);
	const map = useMapStore((state) => state.map);
	const setSelectedTilePosition = useMapStore((state) => state.setSelectedTilePosition);
	const selectEntity = useMapStore((state) => state.selectEntity);

	const [isActive, setIsActive] = useState(false);
	const [previewPosition, setPreviewPosition] = useState<PreviewPosition | null>(null);

	const selectTile = useCallback(
		(tileX: number, tileY: number) => {
			const tileAtPosition = paintedTiles.find(
				(tile) => tile.x === tileX && tile.y === tileY && tile.layer === activeLayer
			);

			if (tileAtPosition && map) {
				const entity = map.entities[tileAtPosition.entityId];

				if (entity) {
					setSelectedTilePosition({
						x: tileX,
						y: tileY,
						layer: activeLayer,
					});
					selectEntity(tileAtPosition.entityId);

					console.log('Tile Selected:', {
						entityId: entity.id,
						position: { x: tileX, y: tileY },
						layer: activeLayer,
						components: entity.components,
						tag: entity.tag,
					});
				}
			} else {
				setSelectedTilePosition(null);
				selectEntity(null);
				console.log('No tile at position:', { x: tileX, y: tileY, layer: activeLayer });
			}
		},
		[activeLayer, paintedTiles, map, setSelectedTilePosition, selectEntity]
	);

	const onTileClick = useCallback(
		(tileX: number, tileY: number) => {
			selectTile(tileX, tileY);
		},
		[selectTile]
	);

	const onTileDrag = useCallback(() => {
	}, []);

	return {
		isActive,
		previewPosition,
		setIsActive,
		setPreviewPosition,
		onTileClick,
		onTileDrag,
	};
}