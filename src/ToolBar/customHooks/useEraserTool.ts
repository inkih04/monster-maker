import { useState, useCallback } from 'react';
import { useMapStore } from '../../Map/MapGState';

interface PreviewPosition {
	x: number;
	y: number;
}

interface UseEraserToolResult {
	isActive: boolean;
	previewPosition: PreviewPosition | null;
	setIsActive: (value: boolean) => void;
	setPreviewPosition: (pos: PreviewPosition | null) => void;
	onTileClick: (
		tileX: number,
		tileY: number,
		modifiers?: { ctrl?: boolean; shift?: boolean }
	) => void;
	onTileDrag: (
		tileX: number,
		tileY: number,
		modifiers?: { ctrl?: boolean; shift?: boolean }
	) => void;
}

export function useEraserTool(): UseEraserToolResult {
	const activeLayer = useMapStore((state) => state.activeLayer);
	const paintedTiles = useMapStore((state) => state.paintedTiles);
	const removeEntity = useMapStore((state) => state.removeEntity);
	const setIsDirty = useMapStore((state) => state.setIsDirty);

	const [isActive, setIsActive] = useState(false);
	const [previewPosition, setPreviewPosition] = useState<PreviewPosition | null>(null);

	const eraseTile = useCallback(
		(tileX: number, tileY: number) => {
			const tilesToErase = paintedTiles.filter(
				(tile) => tile.x === tileX && tile.y === tileY && tile.layer === activeLayer
			);

			if (tilesToErase.length > 0) {
				tilesToErase.forEach((tile) => {
					removeEntity(tile.entityId);
				});
				setIsDirty(true);
			}
		},
		[activeLayer, paintedTiles, removeEntity, setIsDirty]
	);

	const onTileClick = useCallback(
		(tileX: number, tileY: number, _modifiers?: { ctrl?: boolean; shift?: boolean }) => {
			eraseTile(tileX, tileY);
		},
		[eraseTile]
	);

	const onTileDrag = useCallback(
		(tileX: number, tileY: number, _modifiers?: { ctrl?: boolean; shift?: boolean }) => {
			eraseTile(tileX, tileY);
		},
		[eraseTile]
	);

	return {
		isActive,
		previewPosition,
		setIsActive,
		setPreviewPosition,
		onTileClick,
		onTileDrag,
	};
}