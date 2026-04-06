import { create } from 'zustand';

interface OpenFile {
	relativePath: string;
	content: string;
	savedContent: string;
	isDirty: boolean;
}

interface OpenUiFile {
	rmliPath: string;
	htmlPath: string;
	cssPath: string;
	scriptPath: string | null;
	htmlContent: string;
	cssContent: string;
	savedHtmlContent: string;
	savedCssContent: string;
	savedScriptPath: string | null;
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
		rmliPath: string,
		htmlPath: string,
		cssPath: string,
		htmlContent: string,
		cssContent: string,
		scriptPath?: string | null
	) => void;
	updateHtmlContent: (content: string) => void;
	updateCssContent: (content: string) => void;
	updateScriptPath: (path: string | null) => void;
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

	setOpenUiFile: (rmliPath, htmlPath, cssPath, htmlContent, cssContent, scriptPath = null) =>
		set({
			openFile: null,
			openUiFile: {
				rmliPath,
				htmlPath,
				cssPath,
				scriptPath,
				htmlContent,
				cssContent,
				savedHtmlContent: htmlContent,
				savedCssContent: cssContent,
				savedScriptPath: scriptPath,
				isDirty: false,
			},
			isLoadingFile: false,
		}),

	updateHtmlContent: (content) =>
		set((state) => {
			if (!state.openUiFile) return state;
			const isDirty =
				content !== state.openUiFile.savedHtmlContent ||
				state.openUiFile.cssContent !== state.openUiFile.savedCssContent ||
				state.openUiFile.scriptPath !== state.openUiFile.savedScriptPath;
			return { openUiFile: { ...state.openUiFile, htmlContent: content, isDirty } };
		}),

	updateCssContent: (content) =>
		set((state) => {
			if (!state.openUiFile) return state;
			const isDirty =
				state.openUiFile.htmlContent !== state.openUiFile.savedHtmlContent ||
				content !== state.openUiFile.savedCssContent ||
				state.openUiFile.scriptPath !== state.openUiFile.savedScriptPath;
			return { openUiFile: { ...state.openUiFile, cssContent: content, isDirty } };
		}),

	updateScriptPath: (path) =>
		set((state) => {
			if (!state.openUiFile) return state;
			const isDirty =
				state.openUiFile.htmlContent !== state.openUiFile.savedHtmlContent ||
				state.openUiFile.cssContent !== state.openUiFile.savedCssContent ||
				path !== state.openUiFile.savedScriptPath;
			return { openUiFile: { ...state.openUiFile, scriptPath: path, isDirty } };
		}),

	markUiSaved: () =>
		set((state) => {
			if (!state.openUiFile) return state;
			return {
				openUiFile: {
					...state.openUiFile,
					savedHtmlContent: state.openUiFile.htmlContent,
					savedCssContent: state.openUiFile.cssContent,
					savedScriptPath: state.openUiFile.scriptPath,
					isDirty: false,
				},
			};
		}),

	closeUiFile: () => set({ openUiFile: null }),

	setIsLoadingFile: (loading) => set({ isLoadingFile: loading }),
}));
