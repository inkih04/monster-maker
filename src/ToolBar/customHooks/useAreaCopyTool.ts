import { useState, useCallback } from 'react';
import { useMapStore } from '../../Map/MapGState';

interface PreviewPosition {
	x: number;
	y: number;
}

interface CopiedTileData {
	offsetX: number;
	offsetY: number;
	entityId: string; 
}

interface UseAreaCopyToolResult {
	isActive: boolean;
	previewPosition: PreviewPosition | null;
	copiedTiles: CopiedTileData[];
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

export function useAreaCopyTool(): UseAreaCopyToolResult {
	const paintedTiles = useMapStore((state) => state.paintedTiles);
	const activeLayer = useMapStore((state) => state.activeLayer);
	const selectedTilePositions = useMapStore((state) => state.selectedTilePositions);
	const toggleSelectedTilePosition = useMapStore((state) => state.toggleSelectedTilePosition);
	const clearSelection = useMapStore((state) => state.clearSelection);
	const setIsDirty = useMapStore((state) => state.setIsDirty);

	const [isActive, setIsActive] = useState(false);
	const [previewPosition, setPreviewPosition] = useState<PreviewPosition | null>(null);
	const [copiedTiles, setCopiedTiles] = useState<CopiedTileData[]>([]);

	const buildCopyBuffer = useCallback(
		(positions: typeof selectedTilePositions) => {
			if (positions.length === 0) return [];
			const minX = Math.min(...positions.map((p) => p.x));
			const minY = Math.min(...positions.map((p) => p.y));
			return positions.map((pos) => ({
				offsetX: pos.x - minX,
				offsetY: pos.y - minY,
				entityId:
					paintedTiles.find((t) => t.x === pos.x && t.y === pos.y && t.layer === pos.layer)
						?.entityId ?? '',
			}));
		},
		[paintedTiles]
	);

	const onTileClick = useCallback(
		(tileX: number, tileY: number, modifiers?: { ctrl?: boolean; shift?: boolean }) => {
			if (modifiers?.ctrl) {
				const tile = paintedTiles.find(
					(t) => t.x === tileX && t.y === tileY && t.layer === activeLayer
				);
				if (!tile) return;
				toggleSelectedTilePosition({ x: tileX, y: tileY, layer: activeLayer });
				return;
			}

			if (selectedTilePositions.length === 0) return;

			const buffer = buildCopyBuffer(selectedTilePositions);
			if (buffer.length === 0) return;

			const mapState = useMapStore.getState();
			const map = mapState.map;
			if (!map) return;

			const tileSize = map.tileSize;
			const newEntities = { ...map.entities };
			const newPaintedTiles = [...mapState.paintedTiles];

			buffer.forEach(({ offsetX, offsetY, entityId: srcId }) => {
				const destX = tileX + offsetX;
				const destY = tileY + offsetY;

				const srcPos = selectedTilePositions.find(
					(p) =>
						p.x - Math.min(...selectedTilePositions.map((s) => s.x)) === offsetX &&
						p.y - Math.min(...selectedTilePositions.map((s) => s.y)) === offsetY
				);
				if (!srcPos) return;

				const srcTile = mapState.paintedTiles.find(
					(t) => t.x === srcPos.x && t.y === srcPos.y && t.layer === srcPos.layer
				);
				if (!srcTile) return;

				const srcEntity = map.entities[srcTile.entityId];
				if (!srcEntity) return;

				const existingTile = newPaintedTiles.find(
					(t) => t.x === destX && t.y === destY && t.layer === srcTile.layer
				);
				if (existingTile) {
					delete newEntities[existingTile.entityId];
					const idx = newPaintedTiles.findIndex((t) => t === existingTile);
					if (idx !== -1) newPaintedTiles.splice(idx, 1);
				}

				const newId = `tile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_copy`;
				const clonedEntity = {
					...srcEntity,
					id: newId,
					components: {
						...srcEntity.components,
						POSITION: srcEntity.components.POSITION
							? {
									...srcEntity.components.POSITION,
									x: destX * tileSize,
									y: destY * tileSize,
								}
							: srcEntity.components.POSITION,
					},
				};

				newEntities[newId] = clonedEntity;
				newPaintedTiles.push({
					x: destX,
					y: destY,
					tilesetX: srcTile.tilesetX,
					tilesetY: srcTile.tilesetY,
					entityId: newId,
					layer: srcTile.layer,
					spriteSheetPath: srcTile.spriteSheetPath,
				});
			});

			useMapStore.setState({
				map: { ...map, entities: newEntities },
				paintedTiles: newPaintedTiles,
			});
			setIsDirty(true);
		},
		[
			paintedTiles,
			activeLayer,
			selectedTilePositions,
			toggleSelectedTilePosition,
			buildCopyBuffer,
			setIsDirty,
		]
	);

	const onTileDrag = useCallback(
		(_tileX: number, _tileY: number, _modifiers?: { ctrl?: boolean; shift?: boolean }) => {

		},
		[]
	);

	return {
		isActive,
		previewPosition,
		copiedTiles,
		setIsActive,
		setPreviewPosition,
		onTileClick,
		onTileDrag,
	};
}
