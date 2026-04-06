import { useState, useCallback, useRef } from 'react';
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

export function useSelectTool(): UseSelectToolResult {
	const activeLayer = useMapStore((state) => state.activeLayer);
	const paintedTiles = useMapStore((state) => state.paintedTiles);
	const map = useMapStore((state) => state.map);
	const setSelectedTilePosition = useMapStore((state) => state.setSelectedTilePosition);
	const toggleSelectedTilePosition = useMapStore((state) => state.toggleSelectedTilePosition);
	const setSelectedTilePositions = useMapStore((state) => state.setSelectedTilePositions);
	const clearSelection = useMapStore((state) => state.clearSelection);

	const [isActive, setIsActive] = useState(false);
	const [previewPosition, setPreviewPosition] = useState<PreviewPosition | null>(null);

	const dragStartRef = useRef<{ x: number; y: number } | null>(null);

	const getTileAt = useCallback(
		(tileX: number, tileY: number) =>
			paintedTiles.find(
				(tile) => tile.x === tileX && tile.y === tileY && tile.layer === activeLayer
			),
		[paintedTiles, activeLayer]
	);

	const selectSingle = useCallback(
		(tileX: number, tileY: number) => {
			const tile = getTileAt(tileX, tileY);

			if (tile && map) {
				const entity = map.entities[tile.entityId];
				if (entity) {
					setSelectedTilePosition({ x: tileX, y: tileY, layer: activeLayer });

					return;
				}
			}

			clearSelection();
		},
		[getTileAt, map, activeLayer, setSelectedTilePosition, clearSelection]
	);

	const toggleSingle = useCallback(
		(tileX: number, tileY: number) => {
			const tile = getTileAt(tileX, tileY);
			if (!tile || !map?.entities[tile.entityId]) return;
			toggleSelectedTilePosition({ x: tileX, y: tileY, layer: activeLayer });
		},
		[getTileAt, map, activeLayer, toggleSelectedTilePosition]
	);

	const selectArea = useCallback(
		(x1: number, y1: number, x2: number, y2: number) => {
			const minX = Math.min(x1, x2);
			const maxX = Math.max(x1, x2);
			const minY = Math.min(y1, y2);
			const maxY = Math.max(y1, y2);

			const positions = paintedTiles
				.filter(
					(t) => t.layer === activeLayer && t.x >= minX && t.x <= maxX && t.y >= minY && t.y <= maxY
				)
				.map((t) => ({ x: t.x, y: t.y, layer: activeLayer }));

			if (positions.length > 0) {
				setSelectedTilePositions(positions);
			} else {
				clearSelection();
			}
		},
		[paintedTiles, activeLayer, setSelectedTilePositions, clearSelection]
	);

	const onTileClick = useCallback(
		(tileX: number, tileY: number, modifiers?: { ctrl?: boolean; shift?: boolean }) => {
			dragStartRef.current = { x: tileX, y: tileY };

			if (modifiers?.ctrl || modifiers?.shift) {
				toggleSingle(tileX, tileY);
			} else {
				selectSingle(tileX, tileY);
			}
		},
		[selectSingle, toggleSingle]
	);

	const onTileDrag = useCallback(
		(tileX: number, tileY: number, modifiers?: { ctrl?: boolean; shift?: boolean }) => {
			if (!dragStartRef.current) return;
			if (modifiers?.ctrl || modifiers?.shift) {
				toggleSingle(tileX, tileY);
				return;
			}

			selectArea(dragStartRef.current.x, dragStartRef.current.y, tileX, tileY);
		},
		[selectArea, toggleSingle]
	);

	const wrappedSetIsActive = useCallback((value: boolean) => {
		if (!value) {
			dragStartRef.current = null;
		}
		setIsActive(value);
	}, []);

	return {
		isActive,
		previewPosition,
		setIsActive: wrappedSetIsActive,
		setPreviewPosition,
		onTileClick,
		onTileDrag,
	};
}
