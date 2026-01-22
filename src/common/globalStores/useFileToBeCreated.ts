import { create } from 'zustand';

interface FileToBeCreatedStore {
	isOpen: boolean;
	extension: string | null;
	content: string | null;

	setOnOpenChange: (fn: (open: boolean) => void) => void;
	setExtension: (extension: string) => void;
	setOpen: (open: boolean) => void;
	setContent: (content: string) => void;
	reset: () => void;
	createFile: (
		name: string,
		path: string,
	) => Promise<{ success: boolean; error?: string }>;
	onOpenChange: (open: boolean) => void;
}

export const useFileToBeCreatedStore = create<FileToBeCreatedStore>((set, get) => ({
	isOpen: false,
	extension: null,
	content: null,
	onOpenChange: () => {},

	reset: () => {
		set({ extension: null, content: null, onOpenChange: () => {} });
	},
	setContent: (content: string) => set({ content: content }),

	setOnOpenChange: (fn) => set({ onOpenChange: fn }),
	setExtension(extension) {
		set({ extension: extension });
	},
	setOpen: (open: boolean) => set({ isOpen: open }),
	createFile: async (name: string, path: string) => {
		const { extension, content } = get();
		const safeContent = content ?? '';
		const result = await window.api.saveFileCompletePath(name + extension, path, safeContent);
		if (result.success) {
			get().reset();
		}
		return result;
	},
}));
