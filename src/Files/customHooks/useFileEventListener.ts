import { useEffect } from 'react';
import { FileItem } from '../../../global/types/fileItem';
import { useTileSetStore } from '../../Tileset/TileSetGState';


interface UseFileEventListenerProps {
	onRename: (file: FileItem) => void;
	onOpen: (file: FileItem) => void;
	onDelete: (file: FileItem) => void;
}

export function useFileEventListener({ onRename, onOpen, onDelete }: UseFileEventListenerProps) {
	const openTileSizeDialog = useTileSetStore((state) => state.openTileSizeDialog);
	const setCurrentTileSet = useTileSetStore((state) => state.setCurrentTileSet);

	useEffect(() => {
		const cleanup = window.api.onFileAction((action, fileData) => {
			switch (action) {
				case 'rename':
					onRename(fileData);
					break;
				case 'open':
					onOpen(fileData);
					break;
				case 'delete':
					onDelete(fileData);
					break;
				case 'scale':
					if (fileData.path) {
						setCurrentTileSet(fileData.path);
					}
					openTileSizeDialog();
					break;
			}
		});

		return cleanup;
	}, [onRename, onOpen, onDelete, openTileSizeDialog, setCurrentTileSet]);
}
