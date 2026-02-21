import { useState } from 'react';
import { useProjectStore } from '../../Project/ProjectConfigGState';
import { useFolderStore } from '../../common/globalStores/useFolderStore';
import { FileItem } from '../../../global/types/fileItem';
import { useTranslation } from 'react-i18next';
import { useNotify } from '../../common/components/toast/ToastContext';

export function useFileRename() {
	const selectedFolder = useFolderStore((state) => state.selectedFolder);
	const currentProject = useProjectStore((state) => state.currentProject);

	const [renamingFile, setRenamingFile] = useState<string | null>(null);
	const [newFileName, setNewFileName] = useState('');

	const { notify } = useNotify();
	const { t } = useTranslation();

	const startRename = (file: FileItem) => {
		setRenamingFile(file.path);
		setNewFileName(file.name);
	};

	const cancelRename = () => {
		setRenamingFile(null);
		setNewFileName('');
	};

	const handleRenameKeyDown = async (
		e: React.KeyboardEvent<HTMLTextAreaElement>,
		file: FileItem
	) => {
		if (e.key === 'Enter' && selectedFolder?.path && currentProject) {
			if (file.type === 'tilemap') {
				notify(
					t('engine.notifications.warning_title'),
					t('engine.notifications.rename_map_warning'),
					'error',
					2000
				);
			}
			e.preventDefault();
			await window.api.renameFile(file.path, newFileName, selectedFolder.path, currentProject);
			cancelRename();
		} else if (e.key === 'Escape') {
			cancelRename();
		}
	};

	return {
		renamingFile,
		newFileName,
		setNewFileName,
		startRename,
		cancelRename,
		handleRenameKeyDown,
	};
}
