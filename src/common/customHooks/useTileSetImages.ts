import { useEffect, useRef, useState } from 'react';
import { TileSetData } from '../../Tileset/TileSetGState';

export function useTileSetImages(
	tilesets: Record<string, TileSetData>
): Record<string, HTMLImageElement> {
	const imagesRef = useRef<Record<string, HTMLImageElement>>({});
	const [, forceUpdate] = useState({});

	useEffect(() => {
		const validPaths = new Set<string>();

		Object.entries(tilesets).forEach(([path, tileset]) => {
			validPaths.add(path.replace(/\\/g, '/'));

			if (tileset.subImages) {
				const lastSlashRelative = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'));
				const dirRelative =
					lastSlashRelative >= 0
						? path.substring(0, lastSlashRelative + 1).replace(/\\/g, '/')
						: '';

				tileset.subImages.forEach((subImage) => {
					const subImageKey = dirRelative + subImage.file.replace(/\\/g, '/');
					validPaths.add(subImageKey);
				});
			}
		});

		Object.keys(imagesRef.current).forEach((key) => {
			if (!validPaths.has(key)) {
				delete imagesRef.current[key];
			}
		});

		Object.entries(tilesets).forEach(([path, tileset]) => {
			if (!tileset.pathImg) return;
			const pathKey = path.replace(/\\/g, '/');

			if (!imagesRef.current[pathKey]) {
				const img = new Image();
				img.src = `project-file://${tileset.pathImg}`;

				img.onload = () => {
					imagesRef.current[pathKey] = img;
					forceUpdate({});
				};

				img.onerror = () => {
					console.error(`Failed to load tileset image: ${tileset.pathImg}`);
				};
			}

			if (tileset.subImages) {
				const lastSlashIndex = Math.max(
					tileset.pathImg.lastIndexOf('/'),
					tileset.pathImg.lastIndexOf('\\')
				);
				const directory = tileset.pathImg.substring(0, lastSlashIndex);

				const lastSlashRelative = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'));
				const dirRelative =
					lastSlashRelative >= 0
						? path.substring(0, lastSlashRelative + 1).replace(/\\/g, '/')
						: '';

				tileset.subImages.forEach((subImage) => {
					const subImageKey = dirRelative + subImage.file.replace(/\\/g, '/');

					if (!imagesRef.current[subImageKey]) {
						const normalizedSubFile = subImage.file.replace(/\\/g, '/');
						const subImageAbsPath = `${directory}/${normalizedSubFile}`;

						const subImg = new Image();
						subImg.src = `project-file://${subImageAbsPath}`;

						subImg.onload = () => {
							imagesRef.current[subImageKey] = subImg;
							forceUpdate({});
						};

						subImg.onerror = () => {
							console.error(`Failed to load sub-image: ${subImageAbsPath}`);
						};
					}
				});
			}
		});
	}, [tilesets]);

	return imagesRef.current;
}
