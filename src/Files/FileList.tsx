import './FileList.css';
import { getFileIcon } from '../common/utils/filesUtils';
import { useFileWatcher } from '../common/customHooks/useFileWatcher';
import DeleteConfirmation from '../common/components/delete/DeleteConfirmation';
import SaveConfirmation from '../common/components/save/SaveConfirmation';
import { useFileActions } from './customHooks/useFileActions';
import { useFileRename } from './customHooks/useFileRename';
import { useFileEventListener } from './customHooks/useFileEventListener';


export default function FileList() {
	const { files, isLoading } = useFileWatcher();

	const {
		showDeleteConfirm,
		showSaveConfirm,
		fileToDelete,
		setShowDeleteConfirm,
		setShowSaveConfirm,
		tryOpenFile,
		handleOpenFile,
		handleConfirmDelete,
		handleDeleteRequest,
	} = useFileActions();

	const {
		renamingFile,
		newFileName,
		setNewFileName,
		startRename,
		cancelRename,
		handleRenameKeyDown,
	} = useFileRename();

	useFileEventListener({
		onRename: startRename,
		onOpen: tryOpenFile,
		onDelete: handleDeleteRequest,
	});

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
									onBlur={cancelRename}
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
