import { useEffect, useRef, useState } from 'react';
import type FolderNode from '../../../global/types/folderNode';
import { useFolderStore } from '../../common/globalStores/useFolderStore';
import { useProjectStore } from '../../Project/ProjectConfigGState';
import { useNotify } from '../../common/components/toast/ToastContext';
import { useTranslation } from 'react-i18next';

export function useFolderItemActions(folder: FolderNode) {
	const setSelectedFolder = useFolderStore((state) => state.setSelectedFolder);
	const selectedFolder = useFolderStore((state) => state.selectedFolder);
	const creatingFolderUnder = useFolderStore((state) => state.creatingFolderUnder);
	const setCreatingFolderUnder = useFolderStore((state) => state.setCreatingFolderUnder);
	const deletingFolder = useFolderStore((state) => state.deletingFolder);
	const setDeletingFolder = useFolderStore((state) => state.setDeletingFolder);
	const currentProject = useProjectStore((state) => state.currentProject);

	const { notify } = useNotify();
	const { t } = useTranslation();

	const isSelected = selectedFolder?.path === folder.path;
	const isCreatingHere = creatingFolderUnder?.path === folder.path;
	const isConfirmingDelete = deletingFolder?.path === folder.path;

	const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
	const [newFolderName, setNewFolderName] = useState('');
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		const unsubscribeClosed = window.api.onFolderMenuClosed((folderData) => {
			if (folderData.path === folder.path) {
				setIsContextMenuOpen(false);
			}
		});

		const unsubscribeAction = window.api.onFolderAction((action, folderData) => {
			if (folderData.path !== folder.path) return;

			if (action === 'create-folder') {
				setCreatingFolderUnder(folder);
			} else if (action === 'delete-folder') {
				setDeletingFolder(folder);
			}
		});

		return () => {
			unsubscribeClosed();
			unsubscribeAction();
		};
	}, [folder, setCreatingFolderUnder, setDeletingFolder]);

	useEffect(() => {
		if (isCreatingHere) {
			setNewFolderName('');
			requestAnimationFrame(() => inputRef.current?.focus());
		}
	}, [isCreatingHere]);

	const handleClick = () => {
		setSelectedFolder(folder);
	};

	const handleContextMenu = (e: React.MouseEvent) => {
		e.preventDefault();
		setIsContextMenuOpen(true);
		window.api.showFolderContextMenu({ name: folder.name, path: folder.path });
	};

	const cancelCreation = () => {
		setCreatingFolderUnder(null);
		setNewFolderName('');
	};

	const confirmCreation = async () => {
		const trimmed = newFolderName.trim();
		if (!trimmed || !currentProject) {
			cancelCreation();
			return;
		}

		const result = await window.api.createFolder(folder, trimmed, currentProject);

		if (!result.success) {
			console.error('[CreateFolder] Error:', result.error);
		}

		cancelCreation();
	};

	const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Escape') {
			cancelCreation();
		} else if (e.key === 'Enter') {
			confirmCreation();
		}
	};

	const cancelDeletion = () => {
		setDeletingFolder(null);
	};

	const confirmDeletion = async () => {
		if (!currentProject) {
			cancelDeletion();
			return;
		}

		const result = await window.api.deleteFolder(folder, currentProject);

		if (!result.success) {
			if (result?.errorCode === 'ESSENTIAL_FOLDER') {
				notify(t('files'), t('essentialFolder'), 'error', 4000);
			} else {
				notify(t('files'), t('errorFolder'), 'error');
			}
		}

		if (isSelected) {
			setSelectedFolder(null);
		}

		cancelDeletion();
	};

	return {
		isSelected,
		isCreatingHere,
		isConfirmingDelete,
		isContextMenuOpen,
		newFolderName,
		setNewFolderName,
		inputRef,
		handleClick,
		handleContextMenu,
		handleInputKeyDown,
		cancelCreation,
		cancelDeletion,
		confirmDeletion,
	};
}
