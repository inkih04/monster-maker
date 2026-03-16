import { create } from 'zustand';

interface OpenFile {
	relativePath: string;
	content: string;
	savedContent: string;
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
		set({
			openFile: { relativePath, content, savedContent: content, isDirty: false },
			isLoadingFile: false,
		}),

	updateContent: (content) =>
		set((state) => {
			if (!state.openFile) return state;
			return {
				openFile: {
					...state.openFile,
					content,
					isDirty: content !== state.openFile.savedContent,
				},
			};
		}),

	markSaved: () =>
		set((state) => {
			if (!state.openFile) return state;
			return {
				openFile: {
					...state.openFile,
					savedContent: state.openFile.content,
					isDirty: false,
				},
			};
		}),

	closeFile: () => set({ openFile: null }),

	setIsLoadingFile: (loading) => set({ isLoadingFile: loading }),
}));
