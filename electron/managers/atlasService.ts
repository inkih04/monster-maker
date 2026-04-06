import * as fs from 'fs';
import * as path from 'path';
import { Jimp } from 'jimp';
import { TileSetConfig, TileSetSubImage } from '../../global/types/tileSetConfig';

const DEFAULT_MAX_GPU_SIZE = 4096;

export interface SplitTilesetResult {
	success: boolean;
	config?: TileSetConfig;
	error?: string;
}

export class AtlasService {
	async splitTileset(
		imagePath: string,
		configPath: string,
		existingConfig: TileSetConfig,
		maxGpuSize: number = DEFAULT_MAX_GPU_SIZE
	): Promise<SplitTilesetResult> {
		try {
			const image = await Jimp.read(imagePath);
			const atlasWidth = image.width;
			const atlasHeight = image.height;

			if (atlasWidth <= maxGpuSize && atlasHeight <= maxGpuSize) {
				return { success: true, config: existingConfig };
			}

			if (existingConfig.subImages && existingConfig.subImages.length > 0) {
				if (
					existingConfig.atlasWidth === atlasWidth &&
					existingConfig.atlasHeight === atlasHeight
				) {
					return { success: true, config: existingConfig };
				}
			}

			const tileSizeX = existingConfig.tileSizeX;
			const tileSizeY = existingConfig.tileSizeY;

			const tilesPerSliceX = Math.floor(maxGpuSize / tileSizeX);
			const tilesPerSliceY = Math.floor(maxGpuSize / tileSizeY);

			const totalTilesX = Math.floor(atlasWidth / tileSizeX);
			const totalTilesY = Math.floor(atlasHeight / tileSizeY);

			const atlasDir = path.dirname(imagePath);
			const imageBaseName = path.basename(imagePath, path.extname(imagePath));
			const subImagesDir = path.join(atlasDir, `.${imageBaseName}_atlas`);

			if (!fs.existsSync(subImagesDir)) {
				fs.mkdirSync(subImagesDir, { recursive: true });
			}

			const subImages: TileSetSubImage[] = [];

			for (let tileRow = 0; tileRow < totalTilesY; tileRow += tilesPerSliceY) {
				for (let tileCol = 0; tileCol < totalTilesX; tileCol += tilesPerSliceX) {
					const offsetX = tileCol * tileSizeX;
					const offsetY = tileRow * tileSizeY;

					const sliceTilesX = Math.min(tilesPerSliceX, totalTilesX - tileCol);
					const sliceTilesY = Math.min(tilesPerSliceY, totalTilesY - tileRow);

					const slicePixelW = sliceTilesX * tileSizeX;
					const slicePixelH = sliceTilesY * tileSizeY;

					const sliceFileName = `sub_${tileRow / tilesPerSliceY}_${tileCol / tilesPerSliceX}.png`;
					const sliceAbsPath = path.join(subImagesDir, sliceFileName);
					const sliceRelPath = path.join(`.${imageBaseName}_atlas`, sliceFileName);

					const clone = image.clone();
					clone.crop({ x: offsetX, y: offsetY, w: slicePixelW, h: slicePixelH });
					const buffer = await clone.getBuffer('image/png');
					fs.writeFileSync(sliceAbsPath, buffer);

					subImages.push({
						file: sliceRelPath,
						atlasOffsetX: offsetX,
						atlasOffsetY: offsetY,
						widthInTiles: sliceTilesX,
						heightInTiles: sliceTilesY,
					});
				}
			}

			const updatedConfig: TileSetConfig = {
				...existingConfig,
				atlasWidth,
				atlasHeight,
				subImages,
			};

			fs.writeFileSync(configPath, JSON.stringify(updatedConfig, null, 2), 'utf-8');

			return { success: true, config: updatedConfig };
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}
}
