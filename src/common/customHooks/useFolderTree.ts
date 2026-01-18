import { useEffect, useState } from 'react';
import { useProjectStore } from '../../Project/ProjectConfigGState';
import FolderNode from '../../../global/types/folderNode';

export function useFolderTree() {
	const [folderStructure, setFolderStructure] = useState<FolderNode[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const currentProject = useProjectStore((state) => state.currentProject);

	useEffect(() => {
		const loadStructure = async () => {
			if (!currentProject) {
				setFolderStructure([]);
				setIsLoading(false);
				return;
			}

			setIsLoading(true);

			try {
				const result = await window.api.getDirectoryStructure(currentProject);
				if (result.success && result.structure) {
					setFolderStructure(result.structure);
				} else {
					console.error('Error loading directory structure:', result.error);
					setFolderStructure([]);
				}
			} catch (error) {
				console.error('Error loading directory structure:', error);
				setFolderStructure([]);
			} finally {
				setIsLoading(false);
			}
		};

		loadStructure();

		if (currentProject) {
			window.api.startWatchingDirectory(currentProject);

			const cleanup = window.api.onDirectoryStructureChanged((structure) => {
				setFolderStructure(structure);
			});

			return () => {
				window.api.stopWatchingDirectory();
				cleanup();
			};
		}
	}, [currentProject]);

	return {
		folderStructure,
		isLoading,
	};
}
