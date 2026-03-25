import * as Dialog from '@radix-ui/react-dialog';
import './TileSize.css';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTileSetStore } from '../../../Tileset/TileSetGState';
import { useProjectStore } from '../../../Project/ProjectConfigGState';
import { TileSetConfig } from '../../../../global/types/tileSetConfig';

function TileSize() {
	const { t } = useTranslation();
	const [tileSize, setTileSize] = useState(16);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const tilesets = useTileSetStore((state) => state.tilesets);
	const currentPath = useTileSetStore((state) => state.currentTileSetPath);
	const updateTileSet = useTileSetStore((state) => state.updateTileSet);
	const isTileSizeOpen = useTileSetStore((state) => state.isTileSizeOpen);
	const closeTileSizeDialog = useTileSetStore((state) => state.closeTileSizeDialog);
	const currentProject = useProjectStore((state) => state.currentProject);

	const currentTileset = currentPath ? tilesets[currentPath] : null;
	const isTileSizeValid = tileSize > 0 && tileSize % 16 === 0;

	const handleClose = () => {
		closeTileSizeDialog();
	};

	const handleSubmit = async () => {
		if (!currentTileset || !currentProject || !currentPath) return;

		setIsSubmitting(true);

		try {
			const config: TileSetConfig = {
				tileSizeX: tileSize,
				tileSizeY: tileSize,
			};

			const fullProjectPath = await window.api.pathUnion(currentProject.path, currentProject.name);
			const completeConfigPath = await window.api.pathUnion(
				fullProjectPath,
				currentTileset.pathTileMapConfig
			);

			const splitResult = await window.api.splitTileset(
				currentTileset.pathImg,
				completeConfigPath,
				config,
				4096
			);

			if (splitResult.success) {
				if (splitResult.atlasWidth) config.atlasWidth = splitResult.atlasWidth;
				if (splitResult.atlasHeight) config.atlasHeight = splitResult.atlasHeight;
				if (splitResult.subImages) config.subImages = splitResult.subImages;
			} else {
				await window.api.saveFile(
					currentTileset.pathTileMapConfig,
					JSON.stringify(config, null, 2),
					currentProject
				);
			}

			updateTileSet(currentPath, {
				tileSizeX: config.tileSizeX,
				tileSizeY: config.tileSizeY,
				isLoaded: true,
				atlasWidth: config.atlasWidth,
				atlasHeight: config.atlasHeight,
				subImages: config.subImages,
			});

			closeTileSizeDialog();
		} catch (error) {
			console.error('Error while saving the configuration:', error);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog.Root open={isTileSizeOpen} onOpenChange={(open) => !open && handleClose()}>
			<Dialog.Portal>
				<Dialog.Overlay className="tileSize--overlay" onClick={handleClose} />
				<Dialog.Content className="tileSize--wrapper" onEscapeKeyDown={handleClose}>
					<div className="tileSize--header">
						<Dialog.Title className="tileSize--title">{t('tileSizeTitle')}</Dialog.Title>

						<Dialog.Close asChild>
							<button className="tileSize--close" aria-label="Close" onClick={handleClose}>
								×
							</button>
						</Dialog.Close>
					</div>

					<div className="tileSize--form">
						<div className="tileSize--section">
							<label htmlFor="projectDefaultTileSize" className="tileSize--label">
								{t('tileSize')}
							</label>
							<input
								id="projectDefaultTileSize"
								type="number"
								step="16"
								min="16"
								className={`tileSize--input ${!isTileSizeValid ? 'tileSize--input-invalid' : ''}`}
								value={tileSize}
								onChange={(e) => setTileSize(Number(e.target.value))}
								disabled={isSubmitting}
								autoFocus
							/>
						</div>
					</div>

					<div className="tileSize--actions">
						<button
							className="tileSize--btn tileSize--btn-cancel"
							onClick={handleClose}
							disabled={isSubmitting}
						>
							{t('cancel')}
						</button>
						<button
							className="tileSize--btn tileSize--btn-create"
							onClick={handleSubmit}
							disabled={!isTileSizeValid || isSubmitting}
						>
							{isSubmitting ? t('saving') : t('accept')}
						</button>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}

export default TileSize;
