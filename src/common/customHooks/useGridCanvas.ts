import { useEffect, useRef } from 'react';
import { drawGrid, drawSelection } from '../utils/canvasUtils';
import { TileSelection } from '../../Tilemap/TileMapGState';

interface UseGridCanvasProps {
	zoom: number;
	tileSize: number;
	selectedArea: TileSelection | null;
	drawBackground?: (ctx: CanvasRenderingContext2D) => void;
}

export function useGridCanvas({
	zoom,
	tileSize,
	selectedArea,
	drawBackground,
}: UseGridCanvasProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		if (!canvasRef.current) return;

		const canvas = canvasRef.current;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		ctx.clearRect(0, 0, canvas.width, canvas.height);

		drawBackground?.(ctx);

		const scaledTileSize = tileSize * zoom;

		drawGrid({
			ctx,
			width: canvas.width,
			height: canvas.height,
			tileSize: scaledTileSize,
			color: 'white',
			opacity: 0.3,
			lineWidth: 1,
		});

		if (selectedArea) {
			const minX = Math.min(selectedArea.startX, selectedArea.endX);
			const maxX = Math.max(selectedArea.startX, selectedArea.endX);
			const minY = Math.min(selectedArea.startY, selectedArea.endY);
			const maxY = Math.max(selectedArea.startY, selectedArea.endY);

			drawSelection({
				ctx,
				minX,
				minY,
				width: maxX - minX + 1,
				height: maxY - minY + 1,
				tileSize: scaledTileSize,
				fillColor: '0,255,0',
				fillOpacity: 0.2,
				strokeColor: '#00ff00',
				strokeWidth: 2,
			});
		}
	}, [zoom, tileSize, selectedArea, drawBackground]);

	return canvasRef;
}
