import { useState } from 'react';
import { useProjectStore } from '../../Project/ProjectConfigGState';

import { useMapStore } from '../../Map/MapGState';
import type { MapData } from '../../Map/MapGState';
import Entity from '../../domain/ecs/entity';
import { useFolderStore } from '../../common/globalStores/useFolderStore';
import { FileItem } from '../../../global/types/fileItem';
import { TileSetData, useTileSetStore } from '../../Tileset/TileSetGState';
import { useNotify } from '../../common/components/toast/ToastContext';
import { useTranslation } from 'react-i18next';
import FolderNode from '../../../global/types/folderNode';
import { useEngineStore } from '../../ToolBar/EngineGState';
import { useCodeEditorStore } from '../../CodeEditor/CodeEditorGState';
import { TileSetConfig } from '../../../global/types/tileSetConfig';

export function useFileActions() {
	const selectedFolder = useFolderStore((state) => state.selectedFolder);
	const currentProject = useProjectStore((state) => state.currentProject);
	const isDirty = useMapStore((state) => state.isDirty);
	const isCodeDirty = useCodeEditorStore(
		(state) => state.openFile?.isDirty ?? state.openUiFile?.isDirty ?? false
	);
	const loadMap = useMapStore((state) => state.loadMap);
	const setMapRelativePath = useMapStore((state) => state.setMapRelativePath);
	const createMap = useMapStore((state) => state.createMap);
	const addTileSet = useTileSetStore((state) => state.addTileSet);
	const setCurrentTileSet = useTileSetStore((state) => state.setCurrentTileSet);
	const removeTileSet = useTileSetStore((state) => state.removeTileSet);
	const changeEditorMode = useEngineStore((state) => state.changeEditorMode);
	const changeCodeEditorMode = useEngineStore((state) => state.changeCodeEditorMode);

	const isTranslateMode = useEngineStore((state) => state.translate);
	const changeTranslateMode = useEngineStore((state) => state.changeTranslate);

	const { notify } = useNotify();
	const { t } = useTranslation();

	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [showSaveConfirm, setShowSaveConfirm] = useState(false);
	const [fileToDelete, setFileToDelete] = useState<FileItem | null>(null);
	const [fileToOpen, setFileToOpen] = useState<FileItem | null>(null);

	const validateImageSize = (
		path: string,
		maxSize: number = 12000
	): Promise<{ valid: boolean; w: number; h: number }> => {
		return new Promise((resolve) => {
			const img = new Image();
			img.onload = () => {
				const isTooBig = img.width > maxSize || img.height > maxSize;
				resolve({ valid: !isTooBig, w: img.width, h: img.height });
			};
			img.onerror = () => resolve({ valid: false, w: 0, h: 0 });
			img.src = `project-file://${path}`;
		});
	};

	const tryOpenFile = (file: FileItem) => {
		if (!selectedFolder?.path || !currentProject) return;

		setFileToOpen(file);
		console.log(file.type);

		if (file.type == 'tilemap') {
			if (isDirty) {
				setShowSaveConfirm(true);
			} else {
				handleOpenFile(file);
			}
			return;
		}

		if (file.type == 'tileset') {
			changeEditorMode('map');
			handleOpenTileSet(file);
			return;
		}

		if (file.type === 'ui') {
			if (isCodeDirty) {
				setShowSaveConfirm(true);
			} else {
				handleOpenUiFile(file);
			}
			return;
		}

		if (file.type === 'script' || file.type === 'fragment' || file.type === 'vertex') {
			if (isCodeDirty) {
				setShowSaveConfirm(true);
			} else {
				handleOpenScript(file);
			}
			return;
		}

		if (file.type === 'local') {
			//handleOpenLocal(file);
		}
	};

	const handleOpenScript = async (file: FileItem) => {
		changeCodeEditorMode('single');
		changeEditorMode('code');
		changeTranslateMode(false);
		if (!selectedFolder?.path || !currentProject) return;

		useCodeEditorStore.getState().setIsLoadingFile(true);

		const result = await window.api.getFile(file.path, selectedFolder.path, currentProject);
		const relativePath = await window.api.pathUnion(selectedFolder.path, file.path);
		if (result.success && result.content) {
			useCodeEditorStore.getState().setOpenFile(relativePath, result.content.content);
		} else {
			useCodeEditorStore.getState().setIsLoadingFile(false);
		}
		return;
	};

	const handleOpenUiFile = async (file: FileItem) => {
		if (!selectedFolder?.path || !currentProject) return;

		changeEditorMode('code');
		changeCodeEditorMode('duo');
		changeTranslateMode(false);
		useCodeEditorStore.getState().setIsLoadingFile(true);

		try {
			const descriptorResult = await window.api.getFile(
				file.path,
				selectedFolder.path,
				currentProject
			);

			if (!descriptorResult.success || !descriptorResult.content) {
				useCodeEditorStore.getState().setIsLoadingFile(false);
				notify(
					t('engine.notifications.error_title'),
					t('engine.notifications.file_load_error'),
					'error'
				);
				return;
			}

			const descriptor = JSON.parse(descriptorResult.content.content) as {
				htmlPath: string;
				cssPath: string;
				scriptPath: string | null;
			};

			const [htmlResult, cssResult] = await Promise.all([
				window.api.getFile(descriptor.htmlPath, '', currentProject),
				window.api.getFile(descriptor.cssPath, '', currentProject),
			]);

			if (!htmlResult.success || !cssResult.success) {
				useCodeEditorStore.getState().setIsLoadingFile(false);
				notify(
					t('engine.notifications.error_title'),
					t('engine.notifications.file_load_error'),
					'error'
				);
				return;
			}

			useCodeEditorStore
				.getState()
				.setOpenUiFile(
					descriptor.htmlPath,
					descriptor.cssPath,
					htmlResult.content?.content ?? '',
					cssResult.content?.content ?? ''
				);
		} catch (error) {
			console.error('Error opening .ui file:', error);
			useCodeEditorStore.getState().setIsLoadingFile(false);
			notify(
				t('engine.notifications.error_title'),
				t('engine.notifications.file_load_error'),
				'error'
			);
		}
	};

	const handleOpenTileSet = async (file: FileItem) => {
		if (!selectedFolder?.path || !currentProject) return;
		try {
			const lastSlashIndex = Math.max(file.path.lastIndexOf('/'), file.path.lastIndexOf('\\'));
			const directory = file.path.substring(0, lastSlashIndex + 1);
			const fileName = file.path.substring(lastSlashIndex + 1);

			const hiddenJsonName = '.' + fileName.replace(/\.[^/.]+$/, '.json');
			const jsonPath = await window.api.pathUnion(directory, hiddenJsonName);
			const configurationPath = await window.api.pathUnion(selectedFolder.path, jsonPath);
			const completeRelativePath = await window.api.pathUnion(selectedFolder.path, file.path);

			const existingTileSet = useTileSetStore.getState().tilesets[completeRelativePath];
			if (existingTileSet) {
				setCurrentTileSet(completeRelativePath);
				return;
			}

			const result = await window.api.getFile(jsonPath, selectedFolder.path, currentProject);

			const fullProjectPath = await window.api.pathUnion(currentProject.path, currentProject.name);
			const completePath = await window.api.pathUnion(fullProjectPath, completeRelativePath);

			let config: TileSetConfig = {
				tileSizeX: currentProject?.defaultTilesize || 16,
				tileSizeY: currentProject?.defaultTilesize || 16,
			};
			let isLoaded = false;

			if (result.success && result.content?.content) {
				try {
					config = JSON.parse(result.content.content);
					isLoaded = true;
					changeTranslateMode(false);
				} catch (parseError) {
					console.error('Configuration JSON is corrupted', parseError);
				}
			} else {
				const sizeCheck = await validateImageSize(completePath);
				if (!sizeCheck.valid) {
					notify(
						t('engine.notifications.warning_title'),
						t('engine.notifications.texture_too_large', {
							height: sizeCheck.h,
							width: sizeCheck.w,
						}),
						'error'
					);
				}
			}

			const newTileSet: TileSetData = {
				id: crypto.randomUUID(),
				pathImg: completePath,
				pathTileMapConfig: configurationPath,
				relativePath: completeRelativePath,
				tileSizeX: config.tileSizeX || 16,
				tileSizeY: config.tileSizeY || 16,
				isLoaded: isLoaded,
				atlasWidth: config.atlasWidth,
				atlasHeight: config.atlasHeight,
				subImages: config.subImages,
			};

			addTileSet(newTileSet);
			setCurrentTileSet(completeRelativePath);

			if (!isLoaded) {
				useTileSetStore.getState().openTileSizeDialog();
			}
		} catch (error) {
			console.error('Error while tileset:', error);
			notify(
				t('engine.notifications.error_title'),
				t('engine.notifications.tileset_load_error'),
				'error'
			);
		}
	};

	const handleOpenFile = async (file = fileToOpen) => {
		if (!file || !selectedFolder?.path || !currentProject) return;
		if (file.type === 'tilemap') {
			const result = await window.api.getFile(file.path, selectedFolder.path, currentProject);

			if (!result.success || !result.content) return;

			const parsedMap = JSON.parse(result.content.content);

			if (!parsedMap.mapId || !parsedMap.entities) return;

			const mapData: MapData = {
				mapId: parsedMap.mapId,
				width: parsedMap.width || 100,
				height: parsedMap.height || 100,
				tileSize: parsedMap.tileSize || currentProject.defaultTilesize || 16,
				entities: Array.isArray(parsedMap.entities)
					? parsedMap.entities.reduce(
							(acc: Record<string, Entity>, entity: Entity) => {
								acc[entity.id] = entity;
								return acc;
							},
							{} as Record<string, Entity>
						)
					: parsedMap.entities,
			};

			changeTranslateMode(false);
			loadMap(mapData);
			setMapRelativePath(result.content.relativePath);
			setShowSaveConfirm(false);
		} else if (file.type === 'ui') {
			handleOpenUiFile(file);
		} else if (file.type === 'script' || file.type === 'fragment' || file.type === 'vertex') {
			handleOpenScript(file);
		}
	};

	const handleConfirmDelete = async () => {
		if (!fileToDelete || !selectedFolder?.path || !currentProject) return;

		if (fileToDelete.type == 'tilemap') {
			await window.api.deleteFile(fileToDelete.path, selectedFolder.path, currentProject);
			createMap(crypto.randomUUID(), 100, 100, currentProject.defaultTilesize || 16);
		} else if (fileToDelete.type == 'tileset') {
			const lastSlashIndex = Math.max(
				fileToDelete.path.lastIndexOf('/'),
				fileToDelete.path.lastIndexOf('\\')
			);
			const directory = fileToDelete.path.substring(0, lastSlashIndex + 1);
			const fileName = fileToDelete.path.substring(lastSlashIndex + 1);

			const hiddenJsonName = '.' + fileName.replace(/\.[^/.]+$/, '.json');
			const jsonPath = await window.api.pathUnion(directory, hiddenJsonName);
			const completeRelativePath = await window.api.pathUnion(
				selectedFolder.path,
				fileToDelete.path
			);
			removeTileSet(completeRelativePath);

			await window.api.deleteFile(fileToDelete.path, selectedFolder.path, currentProject);
			await window.api.deleteFile(jsonPath, selectedFolder.path, currentProject);
		} else if (fileToDelete.type === 'ui') {
			const fileNameAndExtension = `${fileToDelete.name}.ui`;
			const correctFilePath = await window.api.pathUnion(
				selectedFolder.path,
				fileToDelete.path.replace(fileNameAndExtension, '')
			);
			const hiddenFolderPath = await window.api.pathUnion(correctFilePath, `.${fileToDelete.name}`);

			const folder: FolderNode = {
				name: `.${fileToDelete.name}`,
				path: hiddenFolderPath,
			};

			await window.api.deleteFolder(folder, currentProject);
			await window.api.deleteFile(fileToDelete.path, selectedFolder.path, currentProject);
			changeCodeEditorMode(null);
			changeEditorMode('map');
		} else if (fileToDelete.type === 'script') {
			changeCodeEditorMode(null);
			changeEditorMode('map');
			await window.api.deleteFile(fileToDelete.path, selectedFolder.path, currentProject);
		} else {
			await window.api.deleteFile(fileToDelete.path, selectedFolder.path, currentProject);
		}
		notify(
			t('engine.notifications.deleted_title'),
			t('engine.notifications.file_deleted', { name: fileToDelete.name }),
			'success',
			4000
		);
		setFileToDelete(null);
	};

	const handleDeleteRequest = (file: FileItem) => {
		setFileToDelete(file);
		setShowDeleteConfirm(true);
		if (file.type === 'tilemap') {
			notify(
				t('engine.notifications.warning_title'),
				t('engine.notifications.delete_map_warning'),
				'error',
				4000
			);
		}
	};

	return {
		showDeleteConfirm,
		showSaveConfirm,
		fileToDelete,
		fileToOpen,

		setShowDeleteConfirm,
		setShowSaveConfirm,

		tryOpenFile,
		handleOpenFile,
		handleConfirmDelete,
		handleDeleteRequest,
	};
}
