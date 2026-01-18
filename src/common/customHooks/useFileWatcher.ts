import { useState, useEffect } from 'react';
import { useFolderStore } from '../globalStores/useFolderStore';
import { useProjectStore } from '../../Project/ProjectConfigGState';
import { getFileNameWithoutExtension, getFileType } from '../utils/filesUtils';

interface FileItem {
	name: string;
	type: 'script' | 'tilemap' | 'tileset';
}

const transformToFileItems = (fileNames: string[]): FileItem[] => {
	return fileNames
		.filter((fileName) => {
			const name = fileName.split(/[/\\]/).pop() || fileName;
			return !name.startsWith('.');
		})
		.map((fileName) => ({
			name: getFileNameWithoutExtension(fileName),
			type: getFileType(fileName),
		}));
};

export function useFileWatcher() {
	const [files, setFiles] = useState<FileItem[]>([]);
	const selectedFolder = useFolderStore((state) => state.selectedFolder);
	const currentProject = useProjectStore((state) => state.currentProject);

	const loadFiles = async () => {
		if (!currentProject || !selectedFolder) {
			setFiles([]);
			return;
		}

		try {
			const result = await window.api.getFilesInFolder(currentProject, selectedFolder);

			if (result.success && result.files) {
				setFiles(transformToFileItems(result.files));
			} else {
				setFiles([]);
			}
		} catch (error) {
			console.error('Error loading files:', error);
			setFiles([]);
		}
	};

	useEffect(() => {
		loadFiles();

		if (currentProject && selectedFolder) {
			window.api.startWatchingFiles(currentProject, selectedFolder);

			const cleanup = window.api.onFilesChanged((fileNames) => {
				setFiles(transformToFileItems(fileNames));
			});

			return () => {
				window.api.stopWatchingFiles();
				cleanup();
			};
		}
	}, [currentProject, selectedFolder]);

	return {
		files,
		isLoading: !currentProject || !selectedFolder,
	};
}