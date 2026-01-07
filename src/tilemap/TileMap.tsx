import { useEffect, useRef, useState } from 'react';
import './TileMap.css';

function TileMap() {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [zoom, setZoom] = useState(1);
	const [imageLoaded, setImageLoaded] = useState(false);
	const imageRef = useRef<HTMLImageElement | null>(null);
	const [selectedArea, setSelectedArea] = useState<{
		startX: number;
		startY: number;
		endX: number;
		endY: number;
	} | null>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);

	const TILE_SIZE = 16;

	useEffect(() => {
		const img = new Image();
		img.src = '../../engine/resources/maps/tilesets/TileMap2.png';
		img.onload = () => {
			imageRef.current = img;
			setImageLoaded(true);
		};
	}, []);

	useEffect(() => {
		if (!imageLoaded || !canvasRef.current || !imageRef.current) return;

		const canvas = canvasRef.current;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const img = imageRef.current;

		const scaledWidth = img.width * zoom;
		const scaledHeight = img.height * zoom;

		canvas.width = scaledWidth;
		canvas.height = scaledHeight;

		ctx.clearRect(0, 0, canvas.width, canvas.height);

		ctx.imageSmoothingEnabled = false;
		ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);

		ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
		ctx.lineWidth = 1;

		const tileSize = TILE_SIZE * zoom;

		for (let x = 0; x <= scaledWidth; x += tileSize) {
			ctx.beginPath();
			ctx.moveTo(x, 0);
			ctx.lineTo(x, scaledHeight);
			ctx.stroke();
		}

		for (let y = 0; y <= scaledHeight; y += tileSize) {
			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.lineTo(scaledWidth, y);
			ctx.stroke();
		}

		if (selectedArea) {
			const minX = Math.min(selectedArea.startX, selectedArea.endX);
			const maxX = Math.max(selectedArea.startX, selectedArea.endX);
			const minY = Math.min(selectedArea.startY, selectedArea.endY);
			const maxY = Math.max(selectedArea.startY, selectedArea.endY);

			ctx.fillStyle = 'rgba(0, 255, 0, 0.2)';
			ctx.fillRect(
				minX * tileSize,
				minY * tileSize,
				(maxX - minX + 1) * tileSize,
				(maxY - minY + 1) * tileSize
			);

			ctx.strokeStyle = '#00ff00';
			ctx.lineWidth = 3;
			ctx.strokeRect(
				minX * tileSize,
				minY * tileSize,
				(maxX - minX + 1) * tileSize,
				(maxY - minY + 1) * tileSize
			);
		}
	}, [zoom, imageLoaded, selectedArea]);

	const getTileCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
		if (!canvasRef.current) return null;

		const canvas = canvasRef.current;
		const rect = canvas.getBoundingClientRect();

		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		const tileSize = TILE_SIZE * zoom;

		const tileX = Math.floor(x / tileSize);
		const tileY = Math.floor(y / tileSize);

		return { x: tileX, y: tileY };
	};

	const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
		const coords = getTileCoordinates(e);
		if (!coords) return;

		setIsDragging(true);
		setDragStart(coords);
		setSelectedArea({
			startX: coords.x,
			startY: coords.y,
			endX: coords.x,
			endY: coords.y,
		});
	};

	const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
		if (!isDragging || !dragStart) return;

		const coords = getTileCoordinates(e);
		if (!coords) return;

		setSelectedArea({
			startX: dragStart.x,
			startY: dragStart.y,
			endX: coords.x,
			endY: coords.y,
		});
	};

	const handleMouseUp = () => {
		setIsDragging(false);
		setDragStart(null);
	};

	const handleMouseLeave = () => {
		if (isDragging) {
			setIsDragging(false);
			setDragStart(null);
		}
	};

	const handleZoomIn = () => {
		setZoom((prev) => Math.min(prev + 0.5, 5));
	};

	const handleZoomOut = () => {
		setZoom((prev) => Math.max(prev - 0.5, 0.5));
	};

	const getSelectionInfo = () => {
		if (!selectedArea) return null;

		const minX = Math.min(selectedArea.startX, selectedArea.endX);
		const maxX = Math.max(selectedArea.startX, selectedArea.endX);
		const minY = Math.min(selectedArea.startY, selectedArea.endY);
		const maxY = Math.max(selectedArea.startY, selectedArea.endY);

		const width = maxX - minX + 1;
		const height = maxY - minY + 1;

		return { minX, minY, width, height };
	};

	const selectionInfo = getSelectionInfo();

	return (
		<div className="tilemap-wrapper">
			<div className="tilemap-viewport">
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
					<button onClick={handleZoomOut} className="zoom-btn">
						-
					</button>
					<span className="zoom-level">{Math.round(zoom * 100)}%</span>
					<button onClick={handleZoomIn} className="zoom-btn">
						+
					</button>
				</div>
				<div className="tilemap-controls-name">
					<span>Nombre.png</span>
					{selectionInfo && (
						<span className="tile-coords">
							{' '}
							({selectionInfo.minX}, {selectionInfo.minY}) - {selectionInfo.width}×
							{selectionInfo.height} tiles
						</span>
					)}
				</div>
			</div>
		</div>
	);
}

export default TileMap;
