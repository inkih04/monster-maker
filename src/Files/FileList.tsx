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
	const [renamingFile, setRenamingFile] = useState<string | null>(null);
	const [newFileName, setNewFileName] = useState('');

	useEffect(() => {
		const cleanup = window.api.onFileAction(async (action, fileData) => {
			console.log(`Action: ${action}`, fileData);

			switch (action) {
				case 'rename':
					console.log('Rename file:', fileData.name);
					setRenamingFile(fileData.path);
					setNewFileName(fileData.name);
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

	const handleRenameKeyDown = async (
		e: React.KeyboardEvent<HTMLTextAreaElement>,
		file: { name: string; path: string; type: string }
	) => {
		if (e.key === 'Enter' && selectedFolder?.path && currentProject) {
			e.preventDefault();
			await window.api.renameFile(file.path, newFileName, selectedFolder.path, currentProject);
			console.log('Renombrar archivo:', file.path, 'a:', newFileName);
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
		</>
	);
}
