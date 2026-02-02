import { useState } from 'react';
import { useProjectStore } from '../../Project/ProjectConfigGState';

import { useMapStore } from '../../Map/MapGState';
import type { MapData } from '../../Map/MapGState';
import Entity from '../../domain/ecs/entity';
import { useFolderStore } from '../../common/globalStores/useFolderStore';

interface FileData {
	name: string;
	path: string;
	type: string;
}

export function useFileActions() {
	const selectedFolder = useFolderStore((state) => state.selectedFolder);
	const currentProject = useProjectStore((state) => state.currentProject);
	const isDirty = useMapStore((state) => state.isDirty);
	const loadMap = useMapStore((state) => state.loadMap);
	const setMapRelativePath = useMapStore((state) => state.setMapRelativePath);
	const createMap = useMapStore((state) => state.createMap);

	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [showSaveConfirm, setShowSaveConfirm] = useState(false);
	const [fileToDelete, setFileToDelete] = useState<FileData | null>(null);
	const [fileToOpen, setFileToOpen] = useState<FileData | null>(null);

	const tryOpenFile = (file: FileData) => {
		if (!selectedFolder?.path || !currentProject) return;

		setFileToOpen(file);

		if (isDirty) {
			setShowSaveConfirm(true);
		} else {
			handleOpenFile(file);
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

		await window.api.deleteFile(fileToDelete.path, selectedFolder.path, currentProject);
		createMap(crypto.randomUUID(), 100, 100, currentProject.defaultTilesize || 16);
		setFileToDelete(null);
	};

	const handleDeleteRequest = (file: FileData) => {
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
