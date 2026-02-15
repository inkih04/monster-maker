import './Map.css';
import { useMapStore } from './MapGState';
import { useGridCanvas } from '../common/customHooks/useGridCanvas';
import { useTileSetStore } from '../Tileset/TileSetGState';
import { useTileSetImages } from '../common/customHooks/useTileSetImages';
import { useEffect, useMemo } from 'react';
import { useCanvasMouse } from './customHooks/useCanvasMouse';
import { Layer } from '../domain/ecs/layer';
import { useProjectStore } from '../Project/ProjectConfigGState';
import { useMapCapture } from './customHooks/useMapCapture';
import { useActiveTool } from '../ToolBar/customHooks/useActiveTool';
import { useToolsStore } from '../ToolBar/ToolBarGState';
import {
	drawBrushPreview,
	drawCollisionDebug,
	drawEraserPreview,
	drawSelectionOverlay,
	drawSelectionPreview,
} from './mapUtils';
import { MapLoadingOverlay } from './MapLoadingOverlay';

function Map() {
	const zoom = useMapStore((state) => state.zoom);
	const setZoom = useMapStore((state) => state.setZoom);
	const paintedTiles = useMapStore((state) => state.paintedTiles);
	const setActiveLayer = useMapStore((state) => state.setActiveLayer);
	const activeLayer = useMapStore((state) => state.activeLayer);
	const currentProject = useProjectStore((state) => state.currentProject);
	const tileSets = useTileSetStore((state) => state.tilesets);
	const currentTileSetPath = useTileSetStore((state) => state.currentTileSetPath);
	const tileSize = useMapStore((state) => state.map?.tileSize ?? 16);
	const selectedArea = useTileSetStore((state) => state.selectedArea);
	const createMap = useMapStore((state) => state.createMap);
	const activeTool = useToolsStore((state) => state.activeTool);
	const selectedTilePosition = useMapStore((state) => state.selectedTilePosition);
	const toggleShowCollisions = useMapStore((state) => state.toggleShowCollisions);
	const showCollisions = useMapStore((state) => state.showCollisions);

	useEffect(() => {
		const removeListener = window.api.onToggleCollisions(() => {
			toggleShowCollisions();
			console.log('Toggle collisions activado!');
		});

		return () => {
			removeListener();
		};
	}, [toggleShowCollisions]);

	const currentTileSet = tileSets[currentTileSetPath || ''];

	const { isActive, previewPosition, setIsActive, setPreviewPosition, onTileClick, onTileDrag } =
		useActiveTool();

	const tilesetImages = useTileSetImages(tileSets);

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

	const drawBackground = (ctx: CanvasRenderingContext2D) => {
		const layerOrder: Layer[] = ['ground', 'decoration', 'entities', 'shadows', 'foreground'];
		const mapState = useMapStore.getState();

		layerOrder.forEach((layer) => {
			const tilesInLayer = paintedTiles.filter((tile) => tile.layer === layer);

			tilesInLayer.forEach((tile) => {
				const tileTileset = tileSets[tile.spriteSheetPath];
				const tilesetImage = tilesetImages[tile.spriteSheetPath];

				if (!tileTileset || !tilesetImage || !tileTileset.isLoaded) return;

				const entityData = mapState.map?.entities[tile.entityId];
				const renderComponent = entityData?.components.RENDER;

				if (!renderComponent) return;

				const sourceX = renderComponent.x;
				const sourceY = renderComponent.y;
				const sourceWidth = renderComponent.w;
				const sourceHeight = renderComponent.h;

				const destWidth = renderComponent.width * zoom;
				const destHeight = renderComponent.height * zoom;

				const posX = Math.floor(tile.x) * tileSize * zoom;
				const posY = Math.floor(tile.y) * tileSize * zoom;

				ctx.drawImage(
					tilesetImage,
					sourceX,
					sourceY,
					sourceWidth,
					sourceHeight,
					posX,
					posY,
					destWidth,
					destHeight
				);
			});
		});

		if (activeTool === 'brush' && previewPosition) {
			drawBrushPreview({
				ctx,
				previewPosition,
				isActive,
				currentTileSet,
				currentTileSetPath,
				tilesetImages,
				selectedArea,
				zoom,
			});
		} else if (activeTool === 'eraser' && previewPosition) {
			drawEraserPreview({
				ctx,
				previewPosition,
				isActive,
				paintedTiles,
				activeLayer,
				tileSets,
				tilesetImages,
				tileSize,
				zoom,
				entities: mapState.map?.entities || {},
			});
		} else if (activeTool === 'select') {
			if (previewPosition) {
				drawSelectionPreview({
					ctx,
					previewPosition,
					isActive,
					paintedTiles,
					activeLayer,
					tileSets,
					tilesetImages,
					tileSize,
					zoom,
					entities: mapState.map?.entities || {},
				});
			}
			drawSelectionOverlay({
				ctx,
				selectedTilePosition,
				tileSize,
				zoom,
			});
		}

		if (showCollisions) {
			drawCollisionDebug({
				ctx,
				entities: mapState.map?.entities || {},
				zoom,
			});
		}
	};

	const { canvasRef, containerRef } = useGridCanvas({
		zoom,
		tileSize: tileSize,
		selectedArea: null,
		drawBackground,
		minWidth,
		minHeight,
		redrawTrigger: [paintedTiles, tilesetImages, previewPosition, showCollisions],
	});

	useMapCapture({
		canvasRef,
		drawBackground,
	});

	const { handleMouseDown, handleMouseMove, handleMouseUp, handleMouseLeave } = useCanvasMouse({
		zoom,
		tileSize: tileSize,
		isToolActive: isActive,
		setIsToolActive: setIsActive,
		setPreviewPosition,
		onTileClick: onTileClick,
		onTileDrag: onTileDrag,
	});

	const handleZoomIn = () => {
		setZoom(Math.min(zoom + 0.5, 5));
	};

	const handleZoomOut = () => {
		setZoom(Math.max(zoom - 0.5, 0.5));
	};

	useEffect(() => {
		if (currentProject) {
			createMap(crypto.randomUUID(), 100, 100, currentProject.defaultTilesize || 16);
		}
	}, [currentProject, createMap]);

	return (
		<>
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
			<MapLoadingOverlay />
		</>
	);
}
export default Map;
