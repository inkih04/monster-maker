import { create } from 'zustand';
import { ProjectData } from '../../global/types/projectData';
import { ProjectFile } from '../../global/types/projectFile';
import FolderNode from '../../global/types/folderNode';

export type TranslationRow = {
	key: string;
	[lang: string]: string;
};

const LOCAL_EXT = '.local';

async function getLocalsFolderNode(): Promise<FolderNode> {
	const path = await window.api.pathUnion('resources', '.locals');
	return {
		name: '.locals',
		path: path,
	};
}

async function getLangFilePath(lang: string): Promise<string> {
	const basePath = await window.api.pathUnion('resources', '.locals');
	return await window.api.pathUnion(basePath, `${lang}${LOCAL_EXT}`);
}

function buildRows(fileMap: Map<string, Record<string, string>>): {
	rows: TranslationRow[];
	languages: string[];
} {
	const languages = Array.from(fileMap.keys());
	const keySet = new Set<string>();
	fileMap.forEach((map) => Object.keys(map).forEach((k) => keySet.add(k)));

	const rows: TranslationRow[] = Array.from(keySet).map((key) => {
		const row: TranslationRow = { key };
		languages.forEach((lang) => {
			row[lang] = fileMap.get(lang)?.[key] ?? '';
		});
		return row;
	});

	return { rows, languages };
}

function buildLangRecord(data: TranslationRow[], lang: string): Record<string, string> {
	const result: Record<string, string> = {};
	data.forEach((row) => {
		if (row.key.trim()) {
			result[row.key] = row[lang] ?? '';
		}
	});
	return result;
}

function isTempLang(lang: string): boolean {
	return lang.startsWith('new_');
}

function langFromFileName(fileName: string): string {
	return fileName.replace(/\.local$/, '');
}

interface LocalizationStore {
	data: TranslationRow[];
	languages: string[];
	isLoading: boolean;
	isSaving: boolean;
	error: string | null;

	loadLocalization: (pd: ProjectData) => Promise<void>;
	saveAll: (pd: ProjectData) => Promise<void>;
	updateCell: (rowIndex: number, columnId: string, value: string) => void;
	renameLanguage: (
		oldLang: string,
		newLang: string,
		pd: ProjectData
	) => Promise<{ success: boolean; error?: string }>;
	addLanguage: () => void;
	deleteLanguage: (lang: string, pd: ProjectData) => Promise<{ success: boolean; error?: string }>;
	addRow: () => void;
	deleteRow: (rowIndex: number) => void;
}

export const useLocalizationStore = create<LocalizationStore>((set, get) => ({
	data: [],
	languages: [],
	isLoading: false,
	isSaving: false,
	error: null,

	loadLocalization: async (pd: ProjectData) => {
		set({ isLoading: true, error: null, data: [], languages: [] });

		try {
			const localsFolder = await getLocalsFolderNode();
			const listResult = await window.api.getFilesInFolder(pd, localsFolder);

			if (!listResult.success) {
				console.error(listResult.error ?? 'unknown error');
				set({
					isLoading: false,
					error: listResult.error ?? 'Failed to read .locals folder',
				});
				return;
			}

			const localFiles = listResult.files.filter((f) => f.endsWith(LOCAL_EXT) && !f.includes('/'));

			if (localFiles.length === 0) {
				set({ isLoading: false, data: [], languages: [] });
				return;
			}

			const fileMap = new Map<string, Record<string, string>>();

			await Promise.all(
				localFiles.map(async (fileName) => {
					const lang = langFromFileName(fileName);
					const result = await window.api.getFile(fileName, localsFolder.path, pd);

					if (result.success && result.content) {
						const projectFile = result.content as ProjectFile;
						try {
							fileMap.set(lang, JSON.parse(projectFile.content) as Record<string, string>);
						} catch {
							console.error(fileName);
						}
					} else {
						console.error(result.error ?? 'unknown error');
					}
				})
			);

			const { rows, languages } = buildRows(fileMap);
			set({ data: rows, languages, isLoading: false });
		} catch (err) {
			console.error(err);
			set({ isLoading: false, error: String(err) });
		}
	},

	saveAll: async (pd: ProjectData) => {
		const { data, languages } = get();
		const realLangs = languages.filter((l) => !isTempLang(l));

		if (realLangs.length === 0) return;

		set({ isSaving: true });

		try {
			await Promise.all(
				realLangs.map(async (lang) => {
					const record = buildLangRecord(data, lang);
					const content = JSON.stringify(record, null, 2);
					const fullPath = await getLangFilePath(lang);
					const result = await window.api.saveFile(fullPath, content, pd);

					if (!result.success) {
						console.error(result.error ?? 'unknown error');
					}
				})
			);
		} catch (err) {
			console.error(err);
		} finally {
			set({ isSaving: false });
		}
	},

	updateCell: (rowIndex: number, columnId: string, value: string) => {
		set((state) => ({
			data: state.data.map((row, i) => (i === rowIndex ? { ...row, [columnId]: value } : row)),
		}));
	},

	renameLanguage: async (oldLang: string, newLang: string, pd: ProjectData) => {
		const { languages, data } = get();

		if (languages.includes(newLang)) {
			return { success: false, error: 'Language code already exists' };
		}

		const newLanguages = languages.map((l) => (l === oldLang ? newLang : l));
		const newData = data.map(
			(row) =>
				Object.fromEntries(
					Object.entries(row).map(([k, v]) => (k === oldLang ? [newLang, v] : [k, v]))
				) as TranslationRow
		);

		set({ languages: newLanguages, data: newData });

		await get().saveAll(pd);

		if (!isTempLang(oldLang)) {
			const localsFolder = await getLocalsFolderNode();
			const deleteResult = await window.api.deleteFile(
				`${oldLang}${LOCAL_EXT}`,
				localsFolder.path,
				pd
			);
			if (!deleteResult.success) {
				console.error(deleteResult.error ?? 'unknown error');
			}
		}

		return { success: true };
	},

	addLanguage: () => {
		const tempId = `new_${Date.now()}`;
		set((state) => ({
			languages: [...state.languages, tempId],
			data: state.data.map((row) => ({ ...row, [tempId]: '' })),
		}));
	},

	deleteLanguage: async (lang: string, pd: ProjectData) => {
		if (!isTempLang(lang)) {
			const localsFolder = await getLocalsFolderNode();
			const result = await window.api.deleteFile(`${lang}${LOCAL_EXT}`, localsFolder.path, pd);
			if (!result.success) {
				console.error(result.error ?? 'unknown error');
				return { success: false, error: result.error };
			}
		}

		set((state) => ({
			languages: state.languages.filter((l) => l !== lang),
			data: state.data.map(
				(row) =>
					Object.fromEntries(Object.entries(row).filter(([k]) => k !== lang)) as TranslationRow
			),
		}));

		return { success: true };
	},

	addRow: () => {
		const { languages } = get();
		const newRow: TranslationRow = { key: '' };
		languages.forEach((lang) => {
			newRow[lang] = '';
		});
		set((state) => ({ data: [...state.data, newRow] }));
	},

	deleteRow: (rowIndex: number) => {
		set((state) => ({
			data: state.data.filter((_, i) => i !== rowIndex),
		}));
	},
}));
