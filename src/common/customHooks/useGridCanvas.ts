import { useEffect, useRef } from 'react';
import { drawGrid, drawSelection } from '../utils/canvasUtils';
import { TileSelection } from '../../Tileset/TileSetGState';

interface UseGridCanvasProps {
	zoom: number;
	tileSize: number;
	selectedArea: TileSelection | null;
	drawBackground?: (ctx: CanvasRenderingContext2D) => void;
	minWidth?: number;
	minHeight?: number;
	redrawTrigger?: unknown;
	hideGridAndSelection?: boolean;
}

export function useGridCanvas({
	zoom,
	tileSize,
	selectedArea,
	drawBackground,
	minWidth = 0,
	minHeight = 0,
	redrawTrigger,
	hideGridAndSelection = false,
}: UseGridCanvasProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		const container = containerRef.current;
		if (!canvas || !container) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const renderCanvas = () => {
			const containerWidth = container.clientWidth;
			const containerHeight = container.clientHeight;

			canvas.width = Math.max(containerWidth, minWidth);
			canvas.height = Math.max(containerHeight, minHeight);

			ctx.clearRect(0, 0, canvas.width, canvas.height);
			drawBackground?.(ctx);
			if (!hideGridAndSelection) {
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
						strokeColor: '#00ff0030',
						strokeWidth: 2,
					});
				}
			}
		};

		renderCanvas();

		const resizeObserver = new ResizeObserver(() => {
			renderCanvas();
		});

		resizeObserver.observe(container);

		return () => {
			resizeObserver.disconnect();
		};
	}, [
		zoom,
		tileSize,
		selectedArea,
		drawBackground,
		minWidth,
		minHeight,
		redrawTrigger,
		hideGridAndSelection,
	]);

	return { canvasRef, containerRef };
}
