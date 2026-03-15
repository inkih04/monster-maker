import { useTileSetImages } from '../../common/customHooks/useTileSetImages';
import { useTileSetStore } from '../../Tileset/TileSetGState';
import { useMapStore } from '../MapGState';
import { useGridCanvas } from '../../common/customHooks/useGridCanvas';
import { useCodeEditorLayoutStore } from '../../Layout/CodeEditorLayoutGState';
import { useMemo } from 'react';
import { Layer } from '../../domain/ecs/layer';
import './MapPreview.css';

const LAYER_ORDER: Layer[] = ['ground', 'decoration', 'entities', 'shadows', 'foreground'];

function MapPreview() {
	const zoom = useCodeEditorLayoutStore((state) => state.mapPreviewZoom);
	const setMapPreviewZoom = useCodeEditorLayoutStore((state) => state.setMapPreviewZoom);

	const paintedTiles = useMapStore((state) => state.paintedTiles);
	const map = useMapStore((state) => state.map);
	const visibleLayers = useMapStore((state) => state.visibleLayers);
	const tileSize = map?.tileSize ?? 16;
	const tileSets = useTileSetStore((state) => state.tilesets);
	const tilesetImages = useTileSetImages(tileSets);

	const { minWidth, minHeight } = useMemo(() => {
		const baseX = 50;
		const baseY = 25;
		let maxX = baseX;
		let maxY = baseY;

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
		if (!map || paintedTiles.length === 0) return;

		const mapState = useMapStore.getState();

		LAYER_ORDER.forEach((layer) => {
			if (!visibleLayers[layer]) return;

			paintedTiles
				.filter((tile) => tile.layer === layer)
				.forEach((tile) => {
					const tileTileset = tileSets[tile.spriteSheetPath];
					const tilesetImage = tilesetImages[tile.spriteSheetPath];
					if (!tileTileset || !tilesetImage || !tileTileset.isLoaded) return;

					const entity = mapState.map?.entities[tile.entityId];
					const render = entity?.components.RENDER;
					if (!render) return;

					ctx.drawImage(
						tilesetImage,
						render.x,
						render.y,
						render.w,
						render.h,
						Math.floor(tile.x) * tileSize * zoom,
						Math.floor(tile.y) * tileSize * zoom,
						render.width * zoom,
						render.height * zoom
					);
				});
		});
	};

	const { canvasRef, containerRef } = useGridCanvas({
		zoom,
		tileSize,
		selectedArea: null,
		drawBackground,
		minWidth,
		minHeight,
		redrawTrigger: [paintedTiles, tilesetImages, visibleLayers, zoom],
	});

	const handleZoomIn = () => setMapPreviewZoom(zoom + 0.25);
	const handleZoomOut = () => setMapPreviewZoom(zoom - 0.25);

	return (
		<div className="mapPreview--wrapper">
			<div className="mapPreview--viewport" ref={containerRef}>
				<canvas ref={canvasRef} className="mapPreview--canvas" />
			</div>
			<div className="mapPreview--controls">
				<button onClick={handleZoomIn} className="mapPreview--zoom-btn">
					+
				</button>
				<span className="mapPreview--zoom-level">{Math.round(zoom * 100)}%</span>
				<button onClick={handleZoomOut} className="mapPreview--zoom-btn">
					-
				</button>
			</div>
		</div>
	);
}

export default MapPreview;
