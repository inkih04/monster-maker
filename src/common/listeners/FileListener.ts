import { useEffect } from 'react';
import { useFileToBeCreatedStore } from '../globalStores/useFileToBeCreated';
import { useMapStore } from '../../Map/MapGState';
import { useProjectStore } from '../../Project/ProjectConfigGState';
import { useFolderStore } from '../globalStores/useFolderStore';
import { useTileSetStore } from '../../Tileset/TileSetGState';
import { useEngineStore } from '../../ToolBar/EngineGState';
import { useCodeEditorStore } from '../../CodeEditor/CodeEditorGState';

export function FileListener() {
	const openFileCreation = useFileToBeCreatedStore((state) => state.setOpen);
	const setFileExtension = useFileToBeCreatedStore((state) => state.setExtension);
	const setContent = useFileToBeCreatedStore((state) => state.setContent);

	const mapRelativePath = useMapStore((state) => state.mapRelativePath);
	const currentProject = useProjectStore((state) => state.currentProject);
	const exportToEngineFormat = useMapStore((state) => state.exportToEngineFormat);
	const setIsDirty = useMapStore((state) => state.setIsDirty);

	const resetMap = useMapStore((state) => state.reset);
	const resetProject = useProjectStore((state) => state.reset);
	const resetFolder = useFolderStore((state) => state.reset);
	const resetEditorMode = useEngineStore((state) => state.reset);
	const resetTileSet = useTileSetStore((state) => state.reset);

	useEffect(() => {
		const handleExport = async () => {
			const mapJson = exportToEngineFormat();

			try {
				const result = await window.api.exportMap(mapJson);

				if (result.success) {
					console.log('Map exported successfully to:', result.path);
				} else {
					console.error('Export error:', result.error);
				}
			} catch (error) {
				console.error('Export error:', error);
			}
		};

		const cleanup = window.api.onExportMapRequest(handleExport);

		return cleanup;
	}, [exportToEngineFormat]);

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

				case 'ui':
					extension = '.ui';
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
			const editorMode = useEngineStore.getState().editorMode;

			if (editorMode === 'code') {
				const codeEditorMode = useEngineStore.getState().codeEditorMode;

				if (codeEditorMode === 'single') {
					const { openFile } = useCodeEditorStore.getState();
					if (!openFile || !currentProject) return;
					await window.api.saveFile(openFile.relativePath, openFile.content, currentProject);
					useCodeEditorStore.getState().markSaved();
					return;
				}

				if (codeEditorMode === 'duo') {
					const { openUiFile } = useCodeEditorStore.getState();
					if (!openUiFile) return;
					await Promise.all([
						window.api.saveFileCompletePath('', openUiFile.htmlPath, openUiFile.htmlContent),
						window.api.saveFileCompletePath('', openUiFile.cssPath, openUiFile.cssContent),
					]);
					useCodeEditorStore.getState().markUiSaved();
					return;
				}

				return;
			}
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
		const cleanupCloseProject = window.api.onCloseProject(() => {
			resetMap();
			resetProject();
			resetFolder();
			resetTileSet();
			resetEditorMode();
		});

		return () => {
			cleanupCreate();
			cleanupAdd();
			cleanupSave();
			cleanupCloseProject();
		};
	}, [
		openFileCreation,
		setFileExtension,
		setContent,
		mapRelativePath,
		currentProject,
		exportToEngineFormat,
		setIsDirty,
		resetMap,
		resetProject,
		resetFolder,
		resetTileSet,
		resetEditorMode,
	]);

	return null;
}
