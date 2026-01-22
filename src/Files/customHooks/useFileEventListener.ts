import { useEffect } from 'react';

interface FileData {
	name: string;
	path: string;
	type: string;
}

interface UseFileEventListenerProps {
	onRename: (file: FileData) => void;
	onOpen: (file: FileData) => void;
	onDelete: (file: FileData) => void;
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
