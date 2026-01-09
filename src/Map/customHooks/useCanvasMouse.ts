// ./customHooks/useCanvasMouse.ts
import { useCallback } from 'react';

interface Position {
	x: number;
	y: number;
}

interface UseCanvasMouseParams {
	zoom: number;
	tileSize: number;
	isDrawing: boolean;
	setIsDrawing: (value: boolean) => void;
	setPreviewPosition: (pos: Position | null) => void;
	paintTile: (x: number, y: number) => void;
}

export function useCanvasMouse({
	zoom,
	tileSize,
	isDrawing,
	setIsDrawing,
	setPreviewPosition,
	paintTile,
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
			setIsDrawing(true);
			paintTile(x, y);
		},
		[getTileFromEvent, paintTile, setIsDrawing]
	);

	const handleMouseMove = useCallback(
		(e: React.MouseEvent<HTMLCanvasElement>) => {
			const { x, y } = getTileFromEvent(e);
			setPreviewPosition({ x, y });

			if (isDrawing) {
				paintTile(x, y);
			}
		},
		[getTileFromEvent, isDrawing, paintTile, setPreviewPosition]
	);

	const handleMouseUp = useCallback(() => {
		setIsDrawing(false);
	}, [setIsDrawing]);

	const handleMouseLeave = useCallback(() => {
		setIsDrawing(false);
		setPreviewPosition(null);
	}, [setIsDrawing, setPreviewPosition]);

	return {
		handleMouseDown,
		handleMouseMove,
		handleMouseUp,
		handleMouseLeave,
	};
}
