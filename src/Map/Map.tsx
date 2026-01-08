import './Map.css';
import { useMapStore } from './MapGState';
import { useGridCanvas } from '../common/customHooks/useGridCanvas';
import { useTileSetStore } from '../Tileset/TileSetGState';
import { useTileSetImage } from '../common/customHooks/useTileSetImage';
import { useState } from 'react';

interface PaintedTile {
	x: number;
	y: number;
	tilesetX: number;
	tilesetY: number;
}

function Map() {
	const zoom = useMapStore((state) => state.zoom);
	const setZoom = useMapStore((state) => state.setZoom);
	const tileSets = useTileSetStore((state) => state.tilemaps);
	const currentTileSetId = useTileSetStore((state) => state.currentTileMapId);
	const selectedArea = useTileSetStore((state) => state.selectedArea);
	const setTileMapLoaded = useTileSetStore((state) => state.setTileMapLoaded);

	const currentTileSet = tileSets.find((tm) => tm.id === currentTileSetId);

	const [paintedTiles, setPaintedTiles] = useState<PaintedTile[]>([]);
	const [isDrawing, setIsDrawing] = useState(false);
	const [previewPosition, setPreviewPosition] = useState<{ x: number; y: number } | null>(null);

	const tilesetImageRef = useTileSetImage(currentTileSet, setTileMapLoaded);

	const drawBackground = (ctx: CanvasRenderingContext2D) => {
		const tilesetImage = tilesetImageRef.current;
		if (!tilesetImage || !currentTileSet) return;

		const tileSize = currentTileSet.tileSizeX;
		const scaledTileSize = tileSize * zoom;

		paintedTiles.forEach((tile) => {
			ctx.drawImage(
				tilesetImage,
				tile.tilesetX * tileSize,
				tile.tilesetY * tileSize,
				tileSize,
				tileSize,
				tile.x * scaledTileSize,
				tile.y * scaledTileSize,
				scaledTileSize,
				scaledTileSize
			);
		});

		if (previewPosition && !isDrawing) {
			ctx.globalAlpha = 0.5; 

			if (selectedArea) {
				const minTilesetX = Math.min(selectedArea.startX, selectedArea.endX);
				const maxTilesetX = Math.max(selectedArea.startX, selectedArea.endX);
				const minTilesetY = Math.min(selectedArea.startY, selectedArea.endY);
				const maxTilesetY = Math.max(selectedArea.startY, selectedArea.endY);

				for (let tilesetY = minTilesetY; tilesetY <= maxTilesetY; tilesetY++) {
					for (let tilesetX = minTilesetX; tilesetX <= maxTilesetX; tilesetX++) {
						const offsetX = tilesetX - minTilesetX;
						const offsetY = tilesetY - minTilesetY;
						const mapX = previewPosition.x + offsetX;
						const mapY = previewPosition.y + offsetY;

						ctx.drawImage(
							tilesetImage,
							tilesetX * tileSize,
							tilesetY * tileSize,
							tileSize,
							tileSize,
							mapX * scaledTileSize,
							mapY * scaledTileSize,
							scaledTileSize,
							scaledTileSize
						);
					}
				}
			} else {
				ctx.drawImage(
					tilesetImage,
					0,
					0,
					tileSize,
					tileSize,
					previewPosition.x * scaledTileSize,
					previewPosition.y * scaledTileSize,
					scaledTileSize,
					scaledTileSize
				);
			}

			ctx.globalAlpha = 1.0; 
		}
	};

	const { canvasRef, containerRef } = useGridCanvas({
		zoom,
		tileSize: 16,
		selectedArea: null,
		drawBackground,
		minWidth: 0,
		minHeight: 0,
		redrawTrigger: [paintedTiles, currentTileSet?.isLoaded, previewPosition],
	});

	const handleZoomIn = () => {
		setZoom(Math.min(zoom + 0.5, 5));
	};

	const handleZoomOut = () => {
		setZoom(Math.max(zoom - 0.5, 0.5));
	};

	const paintTile = (tileX: number, tileY: number) => {
		if (!currentTileSet) return;

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

					newTiles.push({
						x: mapX,
						y: mapY,
						tilesetX: tilesetX,
						tilesetY: tilesetY,
					});
				}
			}
		} else {
			newTiles.push({ x: tileX, y: tileY, tilesetX: 0, tilesetY: 0 });
		}

		setPaintedTiles((prev) => {
			const filtered = prev.filter(
				(existing) => !newTiles.some((nt) => nt.x === existing.x && nt.y === existing.y)
			);
			return [...filtered, ...newTiles];
		});
	};

	const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		setIsDrawing(true);

		const rect = canvas.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		const tileX = Math.floor(x / (16 * zoom));
		const tileY = Math.floor(y / (16 * zoom));

		paintTile(tileX, tileY);
	};

	const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const rect = canvas.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		const tileX = Math.floor(x / (16 * zoom));
		const tileY = Math.floor(y / (16 * zoom));

		setPreviewPosition({ x: tileX, y: tileY });

		if (isDrawing) {
			paintTile(tileX, tileY);
		}
	};

	const handleMouseUp = () => {
		setIsDrawing(false);
	};

	const handleMouseLeave = () => {
		setIsDrawing(false);
		setPreviewPosition(null); 
	};

	const handleClearMap = () => {
		setPaintedTiles([]);
	};

	return (
		<div className="tilemap-wrapper">
			<div className="tilemap-viewport" ref={containerRef}>
				<canvas
					ref={canvasRef}
					className="tilemap-canvas"
					onMouseDown={handleMouseDown}
					onMouseMove={handleMouseMove}
					onMouseUp={handleMouseUp}
					onMouseLeave={handleMouseLeave}
				/>
			</div>

			<div className="tilemap-controls">
				<div className="tilemap-controls-zoom">
					<button onClick={handleZoomIn} className="zoom-btn">
						+
					</button>
					<span className="zoom-level">{Math.round(zoom * 100)}%</span>
					<button onClick={handleZoomOut} className="zoom-btn">
						-
					</button>
				</div>
				<button onClick={handleClearMap} className="zoom-btn">
					Limpiar
				</button>
			</div>
		</div>
	);
}

export default Map;
