import { useTileSetStore } from './TileSetGState';
import { useTileSetImage } from '../common/customHooks/useTileSetImage';
import { useGridCanvas } from '../common/customHooks/useGridCanvas';
import { useTileSelection } from '../common/customHooks/useTileSelection';
import { getSelectionInfo, getFileNameFromPath } from './TileSetUtils';
import './TileSet.css';
import { useProjectStore } from '../Project/ProjectConfigGState';
import TileSize from '../common/components/tileSize/TileSize';

function TileSet() {
	const zoom = useTileSetStore((state) => state.zoom);
	const setZoom = useTileSetStore((state) => state.setZoom);
	const selectedArea = useTileSetStore((state) => state.selectedArea);
	const setSelectedArea = useTileSetStore((state) => state.setSelectedArea);
	const currentTileSetPath = useTileSetStore((state) => state.currentTileSetPath);
	const tilesets = useTileSetStore((state) => state.tilesets);
	const setTileSetLoaded = useTileSetStore((state) => state.setTileSetLoaded);
	const currentProject = useProjectStore((state) => state.currentProject);

	const currentTileMap = tilesets[currentTileSetPath || ''];
	const hasTileMap = Boolean(currentTileMap);

	const TILE_SIZE = (currentTileMap?.tileSizeX ?? currentProject?.defaultTilesize) || 16;

	const { imageRef, dimensions } = useTileSetImage(
		hasTileMap ? currentTileMap : null,
		setTileSetLoaded
	);

	const DEFAULT_GRID_SIZE = 20 * TILE_SIZE * zoom;

	const scaledWidth = dimensions.width > 0 ? dimensions.width * zoom : DEFAULT_GRID_SIZE;
	const scaledHeight = dimensions.height > 0 ? dimensions.height * zoom : DEFAULT_GRID_SIZE;

	const { canvasRef, containerRef } = useGridCanvas({
		zoom,
		tileSize: TILE_SIZE,
		selectedArea,
		minWidth: scaledWidth,
		minHeight: scaledHeight,
		drawBackground: (ctx) => {
			if (!hasTileMap || !imageRef.current) return;

			if (imageRef.current.width > 0) {
				ctx.imageSmoothingEnabled = false;
				ctx.drawImage(
					imageRef.current,
					0,
					0,
					imageRef.current.width * zoom,
					imageRef.current.height * zoom
				);
			}
		},
	});

	const { handleMouseDown, handleMouseMove, handleMouseUp, handleMouseLeave } = useTileSelection({
		canvasRef,
		tileSize: TILE_SIZE,
		zoom,
		setSelectedArea,
	});

	const handleZoomIn = () => setZoom(Math.min(zoom + 0.5, 5));
	const handleZoomOut = () => setZoom(Math.max(zoom - 0.5, 0.5));

	const selectionInfo = getSelectionInfo(selectedArea);

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
				<div className="tilemap-controls-name">
					<span>{getFileNameFromPath(currentTileMap?.pathImg)}</span>
					{selectionInfo && (
						<span className="tile-coords">
							({selectionInfo.minX}, {selectionInfo.minY}) - {selectionInfo.width}×
							{selectionInfo.height} tiles
						</span>
					)}
				</div>
			</div>
		</div>
		<TileSize/>
		</>
	);
}

export default TileSet;
