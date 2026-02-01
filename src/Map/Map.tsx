import './Map.css';
import { useMapStore } from './MapGState';
import { useGridCanvas } from '../common/customHooks/useGridCanvas';
import { useTileSetStore } from '../Tileset/TileSetGState';
import { useTileSetImage } from '../common/customHooks/useTileSetImage';
import { useEffect, useMemo } from 'react';
import { useTilePainter } from './customHooks/useTilePainter';
import { useCanvasMouse } from './customHooks/useCanvasMouse';
import { Layer } from '../domain/ecs/layer';
import { useProjectStore } from '../Project/ProjectConfigGState';

function Map() {
	const zoom = useMapStore((state) => state.zoom);
	const setZoom = useMapStore((state) => state.setZoom);
	const paintedTiles = useMapStore((state) => state.paintedTiles);
	const setActiveLayer = useMapStore((state) => state.setActiveLayer);
	const activeLayer = useMapStore((state) => state.activeLayer);
	const exportToEngineFormat = useMapStore((state) => state.exportToEngineFormat);
	const currentProject = useProjectStore((state) => state.currentProject);
	const tileSets = useTileSetStore((state) => state.tilemaps);
	const currentTileSetId = useTileSetStore((state) => state.currentTileMapId);
	const setTileMapLoaded = useTileSetStore((state) => state.setTileMapLoaded);
	const tileSize = useMapStore((state) => state.map?.tileSize ?? 16);
	const selectedArea = useTileSetStore((state) => state.selectedArea);
	const createMap = useMapStore((state) => state.createMap);

	const currentTileSet = tileSets.find((tm) => tm.id === currentTileSetId);

	const { isDrawing, previewPosition, setIsDrawing, setPreviewPosition, paintTile, clearMap } =
		useTilePainter();

	const tilesetImageRef = useTileSetImage(currentTileSet, setTileMapLoaded);

	const { minWidth, minHeight } = useMemo(() => {
		const baseMapWidthInTiles = 50;
		const baseMapHeightInTiles = 25;

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
	}, [paintedTiles, zoom, tileSize]);

	useEffect(() => {
		const handleExport = async () => {
			const mapJson = exportToEngineFormat();

			try {
				const result = await window.api.exportMap(mapJson);

				if (result.success) {
					console.log('Mapa exportado exitosamente a:', result.path);
				} else {
					console.error('Error al exportar:', result.error);
				}
			} catch (error) {
				console.error('Error al exportar:', error);
			}
		};

		const cleanup = window.api.onExportMapRequest(handleExport);

		return cleanup;
	}, [exportToEngineFormat]);

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
		tileSize: tileSize,
		selectedArea: null,
		drawBackground,
		minWidth,
		minHeight,
		redrawTrigger: [paintedTiles, currentTileSet?.isLoaded, previewPosition],
	});

	const { handleMouseDown, handleMouseMove, handleMouseUp, handleMouseLeave } = useCanvasMouse({
		zoom,
		tileSize: tileSize,
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

	useEffect(() => {
		if (currentProject) {
			console.log('Sincronizando TileSize desde el proyecto:', currentProject.defaultTilesize);
			createMap(currentProject.name, 100, 100, currentProject.defaultTilesize);
		}
	}, [currentProject, createMap]); 

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
