import { create } from 'zustand';

interface OpenFile {
	relativePath: string;
	content: string;
	savedContent: string;
	isDirty: boolean;
}

interface OpenUiFile {
	htmlPath: string;
	cssPath: string;
	htmlContent: string;
	cssContent: string;
	savedHtmlContent: string;
	savedCssContent: string;
	isDirty: boolean;
}

interface CodeEditorStore {
	openFile: OpenFile | null;
	openUiFile: OpenUiFile | null;
	isLoadingFile: boolean;

	setOpenFile: (relativePath: string, content: string) => void;
	updateContent: (content: string) => void;
	markSaved: () => void;
	closeFile: () => void;

	setOpenUiFile: (
		htmlPath: string,
		cssPath: string,
		htmlContent: string,
		cssContent: string
	) => void;
	updateHtmlContent: (content: string) => void;
	updateCssContent: (content: string) => void;
	markUiSaved: () => void;
	closeUiFile: () => void;

	setIsLoadingFile: (loading: boolean) => void;
}

export const useCodeEditorStore = create<CodeEditorStore>((set) => ({
	openFile: null,
	openUiFile: null,
	isLoadingFile: false,

	setOpenFile: (relativePath, content) =>
		set({
			openFile: { relativePath, content, savedContent: content, isDirty: false },
			openUiFile: null,
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

	setOpenUiFile: (htmlPath, cssPath, htmlContent, cssContent) =>
		set({
			openFile: null,
			openUiFile: {
				htmlPath,
				cssPath,
				htmlContent,
				cssContent,
				savedHtmlContent: htmlContent,
				savedCssContent: cssContent,
				isDirty: false,
			},
			isLoadingFile: false,
		}),

	updateHtmlContent: (content) =>
		set((state) => {
			if (!state.openUiFile) return state;
			const isDirty =
				content !== state.openUiFile.savedHtmlContent ||
				state.openUiFile.cssContent !== state.openUiFile.savedCssContent;
			return { openUiFile: { ...state.openUiFile, htmlContent: content, isDirty } };
		}),

	updateCssContent: (content) =>
		set((state) => {
			if (!state.openUiFile) return state;
			const isDirty =
				state.openUiFile.htmlContent !== state.openUiFile.savedHtmlContent ||
				content !== state.openUiFile.savedCssContent;
			return { openUiFile: { ...state.openUiFile, cssContent: content, isDirty } };
		}),

	markUiSaved: () =>
		set((state) => {
			if (!state.openUiFile) return state;
			return {
				openUiFile: {
					...state.openUiFile,
					savedHtmlContent: state.openUiFile.htmlContent,
					savedCssContent: state.openUiFile.cssContent,
					isDirty: false,
				},
			};
		}),

	closeUiFile: () => set({ openUiFile: null }),

	setIsLoadingFile: (loading) => set({ isLoadingFile: loading }),
}));
