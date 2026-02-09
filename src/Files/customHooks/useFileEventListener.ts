import { useEffect } from 'react';
import { FileItem } from '../../../global/types/fileItem';



interface UseFileEventListenerProps {
	onRename: (file: FileItem) => void;
	onOpen: (file: FileItem) => void;
	onDelete: (file: FileItem) => void;
}

export function useFileEventListener({ onRename, onOpen, onDelete }: UseFileEventListenerProps) {
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
			}
		});

		return cleanup;
	}, [onRename, onOpen, onDelete]);
}
