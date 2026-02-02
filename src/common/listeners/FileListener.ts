import { useEffect } from 'react';
import { useFileToBeCreatedStore } from '../globalStores/useFileToBeCreated';
import { useMapStore } from '../../Map/MapGState';
import { useProjectStore } from '../../Project/ProjectConfigGState';

export function FileListener() {
	const openFileCreation = useFileToBeCreatedStore((state) => state.setOpen);
	const setFileExtension = useFileToBeCreatedStore((state) => state.setExtension);
	const setContent = useFileToBeCreatedStore((state) => state.setContent);

	const mapRelativePath = useMapStore((state) => state.mapRelativePath);
	const currentProject = useProjectStore((state) => state.currentProject);
	const exportToEngineFormat = useMapStore((state) => state.exportToEngineFormat);
	const setIsDirty = useMapStore((state) => state.setIsDirty);

	useEffect(() => {
		const cleanupCreate = window.api.onCreateNewFile((fileType) => {
			let extension = '';
			let defaultContent = '';

			switch (fileType) {
				case 'map':
					extension = '.json';
					defaultContent = JSON.stringify(
						{
							mapId: crypto.randomUUID(),
							width: 100,
							height: 100,
							tileSize: currentProject?.defaultTilesize || 16,
							entities: {},
						},
						null,
						2
					);
					break;
				case 'prefab':
					extension = '.prefab';
					defaultContent = JSON.stringify(
						{
							prefabId: crypto.randomUUID(),
							components: [],
						},
						null,
						2
					);
					break;
				case 'script':
					extension = '.lua';
					defaultContent = '';
					break;
			}

			setFileExtension(extension);
			setContent(defaultContent);
			openFileCreation(true);
		});

		const cleanupAdd = window.api.onAddNewFile(() => {
			setFileExtension('');
			setContent('');
			openFileCreation(true);
		});

		const cleanupSave = window.api.onSaveFile(async () => {
			const contentMap = exportToEngineFormat();

			if (mapRelativePath && currentProject) {
				const result = await window.api.saveFile(mapRelativePath, contentMap, currentProject);
				setIsDirty(false);
				console.log('File saved:', result);
			} else {
				setFileExtension('.json');
				setContent(contentMap);
				openFileCreation(true);
			}
		});

		return () => {
			cleanupCreate();
			cleanupAdd();
			cleanupSave();
		};
	}, [
		openFileCreation,
		setFileExtension,
		setContent,
		mapRelativePath,
		currentProject,
		exportToEngineFormat,
	]);

	return null;
}
