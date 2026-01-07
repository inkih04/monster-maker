import { useTileMapStore } from './TileMapGState';
import { useTileMapImage } from '../common/customHooks/useTileMapImage';
import { useGridCanvas } from '../common/customHooks/useGridCanvas';
import { useTileSelection } from '../common/customHooks/useTileSelection';
import { getSelectionInfo, getFileNameFromPath } from './TileMapUtils';
import './TileMap.css';

function TileMap() {
	const zoom = useTileMapStore((state) => state.zoom);
	const setZoom = useTileMapStore((state) => state.setZoom);
	const selectedArea = useTileMapStore((state) => state.selectedArea);
	const setSelectedArea = useTileMapStore((state) => state.setSelectedArea);
	const currentTileMapId = useTileMapStore((state) => state.currentTileMapId);
	const tilemaps = useTileMapStore((state) => state.tilemaps);
	const setTileMapLoaded = useTileMapStore((state) => state.setTileMapLoaded);

	const currentTileMap = tilemaps.find((tm) => tm.id === currentTileMapId);
	const TILE_SIZE = currentTileMap?.tileSizeX || 16;

	const imageRef = useTileMapImage(currentTileMap, setTileMapLoaded);

	const canvasRef = useGridCanvas({
		zoom,
		tileSize: TILE_SIZE,
		selectedArea,
		drawBackground: (ctx) => {
			if (!imageRef.current) return;

			const img = imageRef.current;
			const scaledWidth = img.width * zoom;
			const scaledHeight = img.height * zoom;

			ctx.canvas.width = scaledWidth;
			ctx.canvas.height = scaledHeight;

			ctx.imageSmoothingEnabled = false;
			ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);
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

export default TileMap;
