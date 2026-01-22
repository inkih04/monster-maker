import { create } from 'zustand';
import { useMapStore } from '../../Map/MapGState';
import { useProjectStore } from '../../Project/ProjectConfigGState';

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
