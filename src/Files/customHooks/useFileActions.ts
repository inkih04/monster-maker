import { useState } from 'react';
import { useProjectStore } from '../../Project/ProjectConfigGState';

import { useMapStore } from '../../Map/MapGState';
import type { MapData } from '../../Map/MapGState';
import Entity from '../../domain/ecs/entity';
import { useFolderStore } from '../../common/globalStores/useFolderStore';
import { FileItem } from '../../../global/types/fileItem';
import { TileSetData, useTileSetStore } from '../../Tileset/TileSetGState';

export function useFileActions() {
	const selectedFolder = useFolderStore((state) => state.selectedFolder);
	const currentProject = useProjectStore((state) => state.currentProject);
	const isDirty = useMapStore((state) => state.isDirty);
	const loadMap = useMapStore((state) => state.loadMap);
	const setMapRelativePath = useMapStore((state) => state.setMapRelativePath);
	const createMap = useMapStore((state) => state.createMap);
	const addTileSet = useTileSetStore((state) => state.addTileSet);
	const setCurrentTileSet = useTileSetStore((state) => state.setCurrentTileSet);
	const removeTileSet = useTileSetStore((state) => state.removeTileSet);

	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [showSaveConfirm, setShowSaveConfirm] = useState(false);
	const [fileToDelete, setFileToDelete] = useState<FileItem | null>(null);
	const [fileToOpen, setFileToOpen] = useState<FileItem | null>(null);

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
			console.log('tileset');
			handleOpenTileSet(file);
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
			console.log(completePath);

			if (result.success) {
				try {
					if (result.content?.content) {
						const config = JSON.parse(result.content?.content);

						const newTileSet: TileSetData = {
							id: crypto.randomUUID(),
							pathImg: completePath,
							pathTileMapConfig: configurationPath,
							relativePath: completeRelativePath,
							tileSizeX: config.tileSizeX || 16,
							tileSizeY: config.tileSizeY || 16,
							isLoaded: true,
						};

						addTileSet(newTileSet);
						setCurrentTileSet(completeRelativePath);
						console.log('TileSet puest');
					}
				} catch (parseError) {
					console.error('Configuration JSON is corrupted', parseError);
				}
			} else {
				const newTileSet: TileSetData = {
					id: crypto.randomUUID(),
					pathImg: completePath,
					pathTileMapConfig: configurationPath,
					relativePath: completeRelativePath,
					tileSizeX: currentProject?.defaultTilesize || 16,
					tileSizeY: currentProject?.defaultTilesize || 16,
					isLoaded: false,
				};

				addTileSet(newTileSet);
				setCurrentTileSet(completeRelativePath);
			}
		} catch (error) {
			console.error('Error while tileset:', error);
		}
	};

	const handleOpenFile = async (file = fileToOpen) => {
		if (!file || !selectedFolder?.path || !currentProject) return;

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

		loadMap(mapData);
		setMapRelativePath(result.content.relativePath);
		setShowSaveConfirm(false);
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
			const configurationPath = await window.api.pathUnion(selectedFolder.path, jsonPath);

			removeTileSet(configurationPath);

			await window.api.deleteFile(fileToDelete.path, selectedFolder.path, currentProject);
			await window.api.deleteFile(jsonPath, selectedFolder.path, currentProject);
		}

		setFileToDelete(null);
	};

	const handleDeleteRequest = (file: FileItem) => {
		setFileToDelete(file);
		setShowDeleteConfirm(true);
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
