import { useEffect } from 'react';
import './FileList.css';
import { getFileIcon } from '../common/utils/filesUtils';
import { useFileWatcher } from '../common/customHooks/useFileWatcher';
import { useProjectStore } from '../Project/ProjectConfigGState';
import { useFolderStore } from '../common/globalStores/useFolderStore';

export default function FileList() {
	const { files, isLoading } = useFileWatcher();
	const selectedFolder = useFolderStore((state) => state.selectedFolder);
	const currentProject = useProjectStore((state) => state.currentProject);

	console.log(window.api);
	console.log(typeof window.api.deleteFile);

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
					if (selectedFolder?.path && currentProject) {
						const result = await window.api.deleteFile(
							fileData.path,
							selectedFolder.path,
							currentProject
						);
					}
			}
		});

		return cleanup;
	}, [selectedFolder, currentProject]);

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
	);
}
