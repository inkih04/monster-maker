import { useEffect, useRef } from 'react';
import { TileSetData } from '../../Tileset/TileSetGState';

export function useTileSetImage(
	currentTileMap: TileSetData | undefined,
	setTileMapLoaded: (id: string, loaded: boolean) => void
) {
	const imageRef = useRef<HTMLImageElement | null>(null);

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

	return imageRef;
}
