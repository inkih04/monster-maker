import { create } from 'zustand';
import type FolderNode from '../../../global/types/folderNode';

interface FolderStore {
	selectedFolder: FolderNode | null;
	setSelectedFolder: (folder: FolderNode | null) => void;
}

export const useFolderStore = create<FolderStore>((set) => ({
	selectedFolder: null,
	setSelectedFolder: (folder) => set({ selectedFolder: folder }),
}));
