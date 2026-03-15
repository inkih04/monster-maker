import { create } from 'zustand';

interface OpenFile {
	relativePath: string;
	content: string;
	isDirty: boolean;
}

interface CodeEditorStore {
	openFile: OpenFile | null;
	isLoadingFile: boolean;
	setOpenFile: (relativePath: string, content: string) => void;
	updateContent: (content: string) => void;
	markSaved: () => void;
	closeFile: () => void;
	setIsLoadingFile: (loading: boolean) => void;
}

export const useCodeEditorStore = create<CodeEditorStore>((set) => ({
	openFile: null,
	isLoadingFile: false,

	setOpenFile: (relativePath, content) =>
		set({ openFile: { relativePath, content, isDirty: false }, isLoadingFile: false }),

	updateContent: (content) =>
		set((state) =>
			state.openFile ? { openFile: { ...state.openFile, content, isDirty: true } } : state
		),

	markSaved: () =>
		set((state) => (state.openFile ? { openFile: { ...state.openFile, isDirty: false } } : state)),

	closeFile: () => set({ openFile: null }),

	setIsLoadingFile: (loading) => set({ isLoadingFile: loading }),
}));
