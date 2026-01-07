import { useEffect, useRef, useState } from 'react';
import { useTileMapStore } from './TileMapGState'; 
import { drawGrid, drawSelection } from '../common/utils/canvasUtils'; 
import './TileMap.css';

function TileMap() {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const imageRef = useRef<HTMLImageElement | null>(null);
	
	const [isDragging, setIsDragging] = useState(false);
	const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);


	const zoom = useTileMapStore((state) => state.zoom);
	const setZoom = useTileMapStore((state) => state.setZoom);
	const selectedArea = useTileMapStore((state) => state.selectedArea);
	const setSelectedArea = useTileMapStore((state) => state.setSelectedArea);
	const currentTileMapId = useTileMapStore((state) => state.currentTileMapId);
	const tilemaps = useTileMapStore((state) => state.tilemaps);
	const setTileMapLoaded = useTileMapStore((state) => state.setTileMapLoaded);

	const currentTileMap = tilemaps.find((tm) => tm.id === currentTileMapId);
	const TILE_SIZE = currentTileMap?.tileSizeX || 16;


	useEffect(() => {
		if (!currentTileMap) return;

		const img = new Image();
		img.src = currentTileMap.pathImg;
		img.onload = () => {
			imageRef.current = img;
			setTileMapLoaded(currentTileMap.id, true);
		};
		img.onerror = () => {
			console.error(`Error al cargar imagen: ${currentTileMap.pathImg}`);
			setTileMapLoaded(currentTileMap.id, false);
		};

		return () => {
			imageRef.current = null;
		};
	}, [currentTileMap?.id, currentTileMap?.pathImg, setTileMapLoaded]);


	useEffect(() => {
		if (!currentTileMap?.isLoaded || !canvasRef.current || !imageRef.current) return;

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

		const tileSize = TILE_SIZE * zoom;
		drawGrid({
			ctx,
			width: scaledWidth,
			height: scaledHeight,
			tileSize,
			color: 'white',
			opacity: 0.3,
			lineWidth: 1
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
				tileSize,
				fillColor: '0, 255, 0',
				fillOpacity: 0.2,
				strokeColor: '#00ff00',
				strokeWidth: 3
			});
		}
	}, [zoom, currentTileMap?.isLoaded, selectedArea, TILE_SIZE]);

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
		setZoom(Math.min(zoom + 0.5, 5));
	};

	const handleZoomOut = () => {
		setZoom(Math.max(zoom - 0.5, 0.5));
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

	if (!currentTileMap) {
		return <div className="tilemap-wrapper">No hay tilemap seleccionado</div>;
	}

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
					<span>{currentTileMap.pathImg.split('/').pop() || 'Nombre.png'}</span>
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