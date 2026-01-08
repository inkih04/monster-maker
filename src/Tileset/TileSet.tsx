import { useTileSetStore } from './TileSetGState';
import { useTileSetImage } from '../common/customHooks/useTileSetImage';
import { useGridCanvas } from '../common/customHooks/useGridCanvas';
import { useTileSelection } from '../common/customHooks/useTileSelection';
import { getSelectionInfo, getFileNameFromPath } from './TileSetUtils';
import './TileSet.css';

function TileSet() {
	const zoom = useTileSetStore((state) => state.zoom);
	const setZoom = useTileSetStore((state) => state.setZoom);
	const selectedArea = useTileSetStore((state) => state.selectedArea);
	const setSelectedArea = useTileSetStore((state) => state.setSelectedArea);
	const currentTileMapId = useTileSetStore((state) => state.currentTileMapId);
	const tilemaps = useTileSetStore((state) => state.tilemaps);
	const setTileMapLoaded = useTileSetStore((state) => state.setTileMapLoaded);

	const currentTileMap = tilemaps.find((tm) => tm.id === currentTileMapId);
	const TILE_SIZE = currentTileMap?.tileSizeX || 16;

	const imageRef = useTileSetImage(currentTileMap, setTileMapLoaded);

	const scaledWidth = imageRef.current ? imageRef.current.width * zoom : 0;
	const scaledHeight = imageRef.current ? imageRef.current.height * zoom : 0;

	const { canvasRef, containerRef } = useGridCanvas({
		zoom,
		tileSize: TILE_SIZE,
		selectedArea,
		minWidth: scaledWidth,
		minHeight: scaledHeight,
		drawBackground: (ctx) => {
			if (!imageRef.current) return;

			const img = imageRef.current;
			const imgScaledWidth = img.width * zoom;
			const imgScaledHeight = img.height * zoom;

			ctx.imageSmoothingEnabled = false;
			ctx.drawImage(img, 0, 0, imgScaledWidth, imgScaledHeight);
		},
	});

	const { handleMouseDown, handleMouseMove, handleMouseUp, handleMouseLeave } = useTileSelection({
		canvasRef,
		tileSize: TILE_SIZE,
		zoom,
		setSelectedArea,
	});

	const handleZoomIn = () => {
		setZoom(Math.min(zoom + 0.5, 5));
	};

	const handleZoomOut = () => {
		setZoom(Math.max(zoom - 0.5, 0.5));
	};

	const selectionInfo = getSelectionInfo(selectedArea);

	if (!currentTileMap) {
		return <div className="tilemap-wrapper">No hay tilemap seleccionado</div>;
	}

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
				<div className="tilemap-controls-name">
					<span>{getFileNameFromPath(currentTileMap.pathImg)}</span>
					{selectionInfo && (
						<span className="tile-coords">
							({selectionInfo.minX}, {selectionInfo.minY}) - {selectionInfo.width}×
							{selectionInfo.height} tiles
						</span>
					)}
				</div>
			</div>
		</div>
	);
}

export default TileSet;
