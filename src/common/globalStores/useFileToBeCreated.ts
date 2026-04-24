import { create } from 'zustand';
import { useMapStore } from '../../Map/MapGState';
import { useProjectStore } from '../../Project/ProjectConfigGState';
import {
	UI_CSS_DEFAULT_CONTENT,
	UI_HTML_DEFAULT_CONTENT,
} from '../../Files/customHooks/useFileCreate';

interface FileToBeCreatedStore {
	isOpen: boolean;
	extension: string | null;
	content: string | null;
	lastFilePath: string | null;

	setOnOpenChange: (fn: (open: boolean) => void) => void;
	setExtension: (extension: string) => void;
	setOpen: (open: boolean) => void;
	setContent: (content: string) => void;
	reset: () => void;
	createFile: (name: string, path: string) => Promise<{ success: boolean; error?: string }>;
	onOpenChange: (open: boolean) => void;
}

export const useFileToBeCreatedStore = create<FileToBeCreatedStore>((set, get) => ({
	isOpen: false,
	extension: null,
	content: null,
	lastFilePath: null,
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
		set({ lastFilePath: path });
		const { extension, content } = get();

		if (extension === '.ui') {
			const baseName = name.endsWith('.ui') ? name.slice(0, -3) : name;
			const resolvedContent = (content ?? '').split('__UI_NAME__').join(baseName);

			const result = await window.api.saveFileCompletePath(`${baseName}.ui`, path, resolvedContent);

			if (!result.success) {
				return result;
			}

			const hiddenFolderPath = await window.api.pathUnion(path, `.${baseName}`);

			const assetFiles = [
				{
					name: `${baseName}_HTML.rmli`,
					content: UI_HTML_DEFAULT_CONTENT(baseName, `${baseName}_CSS.css`),
				},
				{ name: `${baseName}_CSS.css`, content: UI_CSS_DEFAULT_CONTENT(baseName) },
			];

			for (const file of assetFiles) {
				const assetResult = await window.api.saveFileCompletePath(
					file.name,
					hiddenFolderPath,
					file.content
				);
				if (!assetResult.success) {
					console.error(`[useFileToBeCreated] Failed to create ${file.name}:`, assetResult.error);
				}
			}

			get().reset();
			return result;
		}

		const safeContent = content ?? '';
		const result = await window.api.saveFileCompletePath(name + extension, path, safeContent);

		if (result.success) {
			const isMapFile = extension === '.json';
			const hasMapContent = isMapFileWithContent(safeContent);

			if (isMapFile && hasMapContent) {
				const currentProject = useProjectStore.getState().currentProject;

				if (currentProject) {
					const fullPath = `${path}/${name}${extension}`;
					const resourcesIndex = fullPath.indexOf('resources/');

					let relativePath = fullPath;

					if (resourcesIndex !== -1) {
						relativePath = fullPath.substring(resourcesIndex);
					}

					useMapStore.getState().setIsDirty(false);
					useMapStore.getState().setMapRelativePath(relativePath);
				}
			}

			get().reset();
		}

		return result;
	},
}));

function isMapFileWithContent(content: string): boolean {
	try {
		const parsed = JSON.parse(content);
		if (!parsed.mapId || !parsed.entities) {
			return false;
		}

		const entitiesArray = Array.isArray(parsed.entities)
			? parsed.entities
			: Object.values(parsed.entities);

		return entitiesArray.length > 0;
	} catch {
		return false;
	}
}
