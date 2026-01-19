import { useEffect, useState } from 'react';
import './FileList.css';
import { getFileIcon } from '../common/utils/filesUtils';
import { useFileWatcher } from '../common/customHooks/useFileWatcher';
import { useProjectStore } from '../Project/ProjectConfigGState';
import { useFolderStore } from '../common/globalStores/useFolderStore';
import DeleteConfirmation from '../common/components/delete/DeleteConfirmation';

export default function FileList() {
	const { files, isLoading } = useFileWatcher();
	const selectedFolder = useFolderStore((state) => state.selectedFolder);
	const currentProject = useProjectStore((state) => state.currentProject);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [fileToDelete, setFileToDelete] = useState<{
		name: string;
		path: string;
		type: string;
	} | null>(null);

	useEffect(() => {
		const cleanup = window.api.onFileAction(async (action, fileData) => {
			console.log(`Action: ${action}`, fileData);

			switch (action) {
				case 'rename':
					console.log('Rename file:', fileData.name);
					break;
				case 'copy':
					console.log('Copy file:', fileData.name);
					break;
				case 'delete':
					setFileToDelete(fileData);
					setShowDeleteConfirm(true);
					break;
			}
		});

		return cleanup;
	}, [selectedFolder, currentProject]);

	const handleConfirmDelete = async () => {
		if (fileToDelete && selectedFolder?.path && currentProject) {
			try {
				const result = await window.api.deleteFile(
					fileToDelete.path,
					selectedFolder.path,
					currentProject
				);
				console.log('File deleted:', result);
			} catch (error) {
				console.error('Error deleting file:', error);
			}
		}
		setFileToDelete(null);
	};

	const handleFileContextMenu = (
		e: React.MouseEvent,
		file: { name: string; path: string; type: string }
	) => {
		e.preventDefault();
		e.stopPropagation();

		console.log('Mostrando menú contextual para:', file);

		window.api.showFileContextMenu({
			name: file.name,
			path: file.path,
			type: file.type,
		});
	};

	if (isLoading) {
		return null;
	}

	return (
		<>
			<div className="files--container">
				<div className="files--grid">
					{files.map((file, index) => (
						<div
							key={`${file.path}-${index}`}
							className="files--item"
							onContextMenu={(e) => handleFileContextMenu(e, file)}
						>
							<div className="files--icon">{getFileIcon(file.type)}</div>
							<span className="files--name">{file.name}</span>
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
		</>
	);
}
