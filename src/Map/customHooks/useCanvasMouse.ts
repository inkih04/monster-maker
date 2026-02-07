import { useCallback } from 'react';

interface Position {
	x: number;
	y: number;
}

interface UseCanvasMouseParams {
	zoom: number;
	tileSize: number;
	isToolActive: boolean; 
	setIsToolActive: (value: boolean) => void; 
	setPreviewPosition: (pos: Position | null) => void;
	onTileClick: (x: number, y: number) => void; 
	onTileDrag: (x: number, y: number) => void; 
}

export function useCanvasMouse({
	zoom,
	tileSize,
	isToolActive,
	setIsToolActive,
	setPreviewPosition,
	onTileClick,
	onTileDrag,
}: UseCanvasMouseParams) {
	const getTileFromEvent = useCallback(
		(e: React.MouseEvent<HTMLCanvasElement>) => {
			const rect = e.currentTarget.getBoundingClientRect();
			const x = Math.floor((e.clientX - rect.left) / (tileSize * zoom));
			const y = Math.floor((e.clientY - rect.top) / (tileSize * zoom));
			return { x, y };
		},
		[tileSize, zoom]
	);

	const handleMouseDown = useCallback(
		(e: React.MouseEvent<HTMLCanvasElement>) => {
			const { x, y } = getTileFromEvent(e);
			setIsToolActive(true);
			onTileClick(x, y);
		},
		[getTileFromEvent, onTileClick, setIsToolActive]
	);

	const handleMouseMove = useCallback(
		(e: React.MouseEvent<HTMLCanvasElement>) => {
			const { x, y } = getTileFromEvent(e);
			setPreviewPosition({ x, y });

			if (isToolActive) {
				onTileDrag(x, y);
			}
		},
		[getTileFromEvent, isToolActive, onTileDrag, setPreviewPosition]
	);

	const handleMouseUp = useCallback(() => {
		setIsToolActive(false);
	}, [setIsToolActive]);

	const handleMouseLeave = useCallback(() => {
		setIsToolActive(false);
		setPreviewPosition(null);
	}, [setIsToolActive, setPreviewPosition]);

	return {
		handleMouseDown,
		handleMouseMove,
		handleMouseUp,
		handleMouseLeave,
	};
}