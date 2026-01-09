import './Map.css';
import { useMapStore } from './MapGState';
import { useGridCanvas } from '../common/customHooks/useGridCanvas';
import { useTileSetStore } from '../Tileset/TileSetGState';
import { useTileSetImage } from '../common/customHooks/useTileSetImage';
import { useMemo } from 'react';
import { useTilePainter } from './customHooks/useTilePainter';
import { useCanvasMouse } from './customHooks/useCanvasMouse';
import { Layer } from '../domain/ecs/layer';

function Map() {
	const zoom = useMapStore((state) => state.zoom);
	const setZoom = useMapStore((state) => state.setZoom);

	const tileSets = useTileSetStore((state) => state.tilemaps);
	const currentTileSetId = useTileSetStore((state) => state.currentTileMapId);
	const setTileMapLoaded = useTileSetStore((state) => state.setTileMapLoaded);
	const selectedArea = useTileSetStore((state) => state.selectedArea);
	const setActiveLayer = useMapStore((state) => state.setActiveLayer);
	const activeLayer = useMapStore((state) => state.activeLayer);

	const currentTileSet = tileSets.find((tm) => tm.id === currentTileSetId);

	const {
		paintedTiles,
		isDrawing,
		previewPosition,
		setIsDrawing,
		setPreviewPosition,
		paintTile,
		clearMap,
	} = useTilePainter();

	const tilesetImageRef = useTileSetImage(currentTileSet, setTileMapLoaded);

	const { minWidth, minHeight } = useMemo(() => {
		const baseMapWidthInTiles = 50;
		const baseMapHeightInTiles = 25;
		const tileSize = 16; //todo: lo tengo que sacar del mapa

		let maxX = baseMapWidthInTiles;
		let maxY = baseMapHeightInTiles;

		if (paintedTiles.length > 0) {
			maxX = Math.max(...paintedTiles.map((t) => t.x)) + 10;
			maxY = Math.max(...paintedTiles.map((t) => t.y)) + 10;
		}

		return {
			minWidth: maxX * tileSize * zoom,
			minHeight: maxY * tileSize * zoom,
		};
	}, [paintedTiles, zoom]);

	const drawBackground = (ctx: CanvasRenderingContext2D) => {
		const tilesetImage = tilesetImageRef.current;
		if (!tilesetImage || !currentTileSet) return;

		const tileSize = currentTileSet.tileSizeX;
		const scaledTileSize = tileSize * zoom;

		const layerOrder: Layer[] = ['ground', 'decoration', 'entities', 'shadows', 'foreground'];

		layerOrder.forEach((layer) => {
			const tilesInLayer = paintedTiles.filter((tile) => tile.layer === layer);

			tilesInLayer.forEach((tile) => {
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
		});

		if (previewPosition && !isDrawing) {
			ctx.globalAlpha = 0.5;

			if (selectedArea) {
				const minX = Math.min(selectedArea.startX, selectedArea.endX);
				const maxX = Math.max(selectedArea.startX, selectedArea.endX);
				const minY = Math.min(selectedArea.startY, selectedArea.endY);
				const maxY = Math.max(selectedArea.startY, selectedArea.endY);

				for (let y = minY; y <= maxY; y++) {
					for (let x = minX; x <= maxX; x++) {
						ctx.drawImage(
							tilesetImage,
							x * tileSize,
							y * tileSize,
							tileSize,
							tileSize,
							(previewPosition.x + (x - minX)) * scaledTileSize,
							(previewPosition.y + (y - minY)) * scaledTileSize,
							scaledTileSize,
							scaledTileSize
						);
					}
				}
			}

			ctx.globalAlpha = 1;
		}
	};

	const { canvasRef, containerRef } = useGridCanvas({
		zoom,
		tileSize: 16,
		selectedArea: null,
		drawBackground,
		minWidth,
		minHeight,
		redrawTrigger: [paintedTiles, currentTileSet?.isLoaded, previewPosition],
	});

	const { handleMouseDown, handleMouseMove, handleMouseUp, handleMouseLeave } = useCanvasMouse({
		zoom,
		tileSize: 16,
		isDrawing,
		setIsDrawing,
		setPreviewPosition,
		paintTile,
	});

	const handleZoomIn = () => {
		setZoom(Math.min(zoom + 0.5, 5));
	};

	const handleZoomOut = () => {
		setZoom(Math.max(zoom - 0.5, 0.5));
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
			<div className="map-controls">
				<div className="layers-container">
					<button
						className={`layer-button ${activeLayer === 'ground' ? 'layer-active' : ''}`}
						onClick={() => {
							setActiveLayer('ground');
						}}
					>
						Ground
					</button>
					<button
						className={`layer-button ${activeLayer === 'decoration' ? 'layer-active' : ''}`}
						onClick={() => {
							setActiveLayer('decoration');
						}}
					>
						Decoration
					</button>
					<button
						className={`layer-button ${activeLayer === 'entities' ? 'layer-active' : ''}`}
						onClick={() => {
							setActiveLayer('entities');
						}}
					>
						Entities
					</button>
					<button
						className={`layer-button ${activeLayer === 'shadows' ? 'layer-active' : ''}`}
						onClick={() => {
							setActiveLayer('shadows');
						}}
					>
						Shadows
					</button>
					<button
						className={`layer-button ${activeLayer === 'foreground' ? 'layer-active' : ''}`}
						onClick={() => {
							setActiveLayer('foreground');
						}}
					>
						Foreground
					</button>
					<button className="layer-button" onClick={clearMap}>
						clean
					</button>
				</div>
				<div className="map-controls-zoom">
					<button onClick={handleZoomIn} className="zoom-btn">
						+
					</button>

					<span className="zoom-level">{Math.round(zoom * 100)}%</span>
					<button onClick={handleZoomOut} className="zoom-btn">
						-
					</button>
				</div>
			</div>
		</div>
	);
}
export default Map;
