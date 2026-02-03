import { useEffect, useRef, useState } from 'react';
import { TileSetData } from '../../Tileset/TileSetGState';

export function useTileSetImage(
	currentTileMap: TileSetData | undefined | null,
	setTileMapLoaded: (path: string, loaded: boolean) => void
) {
	const imageRef = useRef<HTMLImageElement | null>(null);
	const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

	useEffect(() => {
		if (!currentTileMap) return;

		const img = new Image();
		img.src = `project-file://${currentTileMap.pathImg}`;

		img.onload = () => {
			imageRef.current = img;
			setDimensions({ width: img.width, height: img.height })
			setTileMapLoaded(currentTileMap.id, true);
		};

		img.onerror = () => {
			console.error(`Error while loading image: ${currentTileMap.pathImg}`);
			setTileMapLoaded(currentTileMap.id, false);
		};

		return () => {
			imageRef.current = null;
		};
	}, [currentTileMap?.id, currentTileMap?.pathImg, setTileMapLoaded]);

	return {imageRef, dimensions};
}
