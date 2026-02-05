import { useEffect, useRef, useState } from 'react';
import { TileSetData } from '../../Tileset/TileSetGState';

export function useTileSetImages(
	tilesets: Record<string, TileSetData>
): Record<string, HTMLImageElement> {
	const imagesRef = useRef<Record<string, HTMLImageElement>>({});
	const [, forceUpdate] = useState({});

	useEffect(() => {
		Object.keys(imagesRef.current).forEach((path) => {
			if (!tilesets[path]) {
				delete imagesRef.current[path];
			}
		});

		Object.entries(tilesets).forEach(([path, tileset]) => {
			if (!tileset.pathImg) return;

			if (imagesRef.current[path] && imagesRef.current[path].src.endsWith(tileset.pathImg)) {
				return;
			}

			const img = new Image();
			img.src = `project-file://${tileset.pathImg}`;

			img.onload = () => {
				imagesRef.current[path] = img;
				forceUpdate({});
			};

			img.onerror = () => {
				console.error(`Failed to load tileset image: ${tileset.pathImg}`);
			};
		});

		return () => {};
	}, [tilesets]);

	return imagesRef.current;
}
