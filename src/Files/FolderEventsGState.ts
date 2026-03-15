import { create } from 'zustand';

interface FolderEvent {
	action: string;
	folderPath: string;
}

interface FolderMenuClosedEvent {
	folderPath: string;
}

interface FolderEventsStore {
	lastFolderAction: FolderEvent | null;
	lastFolderMenuClosed: FolderMenuClosedEvent | null;
	dispatchFolderAction: (action: string, folderPath: string) => void;
	dispatchFolderMenuClosed: (folderPath: string) => void;
}

export const useFolderEventsStore = create<FolderEventsStore>((set) => ({
	lastFolderAction: null,
	lastFolderMenuClosed: null,

	dispatchFolderAction: (action, folderPath) =>
		set({ lastFolderAction: { action, folderPath } }),

	dispatchFolderMenuClosed: (folderPath) =>
		set({ lastFolderMenuClosed: { folderPath } }),
}));