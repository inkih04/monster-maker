import { create } from 'zustand';
import type FolderNode from '../../../global/types/folderNode';

interface FolderStore {
	selectedFolder: FolderNode | null;
	setSelectedFolder: (folder: FolderNode | null) => void;

	creatingFolderUnder: FolderNode | null;
	setCreatingFolderUnder: (folder: FolderNode | null) => void;

	deletingFolder: FolderNode | null;
	setDeletingFolder: (folder: FolderNode | null) => void;
	reset: () => void;
}

export const useFolderStore = create<FolderStore>((set) => ({
	selectedFolder: null,
	setSelectedFolder: (folder) => set({ selectedFolder: folder }),

	reset: () => {
		set({ selectedFolder: null });
	},

	creatingFolderUnder: null,
	setCreatingFolderUnder: (folder) => set({ creatingFolderUnder: folder }),

	deletingFolder: null,
	setDeletingFolder: (folder) => set({ deletingFolder: folder }),
}));
