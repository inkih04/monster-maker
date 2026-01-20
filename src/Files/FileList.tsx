import { useEffect, useState } from 'react';
import './FileList.css';
import { getFileIcon } from '../common/utils/filesUtils';
import { useFileWatcher } from '../common/customHooks/useFileWatcher';
import { useProjectStore } from '../Project/ProjectConfigGState';
import { useFolderStore } from '../common/globalStores/useFolderStore';
import DeleteConfirmation from '../common/components/delete/DeleteConfirmation';
import { useMapStore } from '../Map/MapGState';
import type { MapData } from '../Map/MapGState';
import Entity from '../domain/ecs/entity';
import SaveConfirmation from '../common/components/save/SaveConfirmation';

export default function FileList() {
	const { files, isLoading } = useFileWatcher();
	const selectedFolder = useFolderStore((state) => state.selectedFolder);
	const currentProject = useProjectStore((state) => state.currentProject);
	const isDirty = useMapStore((state) => state.isDirty);
	const loadMap = useMapStore((state) => state.loadMap);
	const setMapRelativePath = useMapStore((state) => state.setMapRelativePath);

	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [showSaveConfirm, setShowSaveConfirm] = useState(false);

	const [fileToDelete, setFileToDelete] = useState<{
		name: string;
		path: string;
		type: string;
	} | null>(null);

	const [fileToOpen, setFileToOpen] = useState<{
		name: string;
		path: string;
		type: string;
	} | null>(null);

	const [renamingFile, setRenamingFile] = useState<string | null>(null);
	const [newFileName, setNewFileName] = useState('');

	const tryOpenFile = (file: { name: string; path: string; type: string }) => {
		if (!selectedFolder?.path || !currentProject) return;

		setFileToOpen(file);

		if (isDirty) {
			setShowSaveConfirm(true);
		} else {
			handleOpenFile(file);
		}
	};

	useEffect(() => {
		const cleanup = window.api.onFileAction((action, fileData) => {
			switch (action) {
				case 'rename':
					setRenamingFile(fileData.path);
					setNewFileName(fileData.name);
					break;

				case 'open':
					tryOpenFile(fileData);
					break;

				case 'delete':
					setFileToDelete(fileData);
					setShowDeleteConfirm(true);
					break;
			}
		});

		return cleanup;
	}, [selectedFolder, currentProject, isDirty]);

	const handleConfirmDelete = async () => {
		if (!fileToDelete || !selectedFolder?.path || !currentProject) return;

		await window.api.deleteFile(fileToDelete.path, selectedFolder.path, currentProject);

		setFileToDelete(null);
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
			tileSize: parsedMap.tileSize || 16,
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

	const handleRenameKeyDown = async (
		e: React.KeyboardEvent<HTMLTextAreaElement>,
		file: { name: string; path: string; type: string }
	) => {
		if (e.key === 'Enter' && selectedFolder?.path && currentProject) {
			e.preventDefault();
			await window.api.renameFile(file.path, newFileName, selectedFolder.path, currentProject);
			setRenamingFile(null);
			setNewFileName('');
		} else if (e.key === 'Escape') {
			setRenamingFile(null);
			setNewFileName('');
		}
	};

	const handleFileContextMenu = (
		e: React.MouseEvent,
		file: { name: string; path: string; type: string }
	) => {
		e.preventDefault();
		e.stopPropagation();

		window.api.showFileContextMenu({
			name: file.name,
			path: file.path,
			type: file.type,
		});
	};

	if (isLoading) return null;

	return (
		<>
			<div className="files--container">
				<div className="files--grid">
					{files.map((file, index) => (
						<div
							key={`${file.path}-${index}`}
							className="files--item"
							onContextMenu={(e) => handleFileContextMenu(e, file)}
							onDoubleClick={() => {
								if (renamingFile) return;
								tryOpenFile(file);
							}}
						>
							<div className="files--icon">{getFileIcon(file.type)}</div>
							{renamingFile === file.path ? (
								<textarea
									className="files--name files--rename-input"
									value={newFileName}
									onChange={(e) => setNewFileName(e.target.value)}
									onKeyDown={(e) => handleRenameKeyDown(e, file)}
									onBlur={() => {
										setRenamingFile(null);
										setNewFileName('');
									}}
									autoFocus
									rows={1}
								/>
							) : (
								<span className="files--name">{file.name}</span>
							)}
						</div>
					))}
				</div>
			</div>

			<DeleteConfirmation
				open={showDeleteConfirm}
				onOpenChange={setShowDeleteConfirm}
				itemName={fileToDelete?.name || ''}
				onConfirm={handleConfirmDelete}
			/>

			<SaveConfirmation
				open={showSaveConfirm}
				onOpenChange={setShowSaveConfirm}
				onConfirm={() => handleOpenFile()}
			/>
		</>
	);
}
