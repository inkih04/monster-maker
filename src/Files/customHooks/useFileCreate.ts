import { useEffect, useRef, useState } from 'react';
import { useProjectStore } from '../../Project/ProjectConfigGState';
import { useFolderStore } from '../../common/globalStores/useFolderStore';
import { useNotify } from '../../common/components/toast/ToastContext';
import { useTranslation } from 'react-i18next';
import { uiHtmlDefaultContent } from '../defaultContentFiles/ui/uiHtmlDefaultContent';
import { uiCssDefaultContent } from '../defaultContentFiles/ui/uiCssDefaultContent';
import { scriptContent } from '../defaultContentFiles/scripts/scriptDefaultContent';
import { useEngineConfigStore } from '../../Tagger/useEngineConfigStore';

export type CreatableFileType = 'map' | 'prefab' | 'script' | 'ui' | 'dialog';

export const CREATABLE_TYPE_TO_ICON: Record<CreatableFileType, string> = {
	map: 'tilemap',
	prefab: 'undefined',
	script: 'script',
	ui: 'ui',
	dialog: 'dialog',
};

const FILE_EXTENSIONS: Record<CreatableFileType, string> = {
	map: '.map',
	prefab: '.prefab',
	script: '.lua',
	ui: '.ui',
	dialog: '.json',
};

export const UI_HTML_DEFAULT_CONTENT = (fileName: string, cssPath: string): string =>
	uiHtmlDefaultContent(fileName, cssPath);
export const UI_CSS_DEFAULT_CONTENT = (fileName: string): string => uiCssDefaultContent(fileName);

const FILE_DEFAULT_CONTENT: Record<CreatableFileType, (tilesize: number) => string> = {
	map: (tilesize) =>
		JSON.stringify(
			{
				mapId: crypto.randomUUID(),
				width: 100,
				height: 100,
				tileSize: tilesize,
				entities: {},
			},
			null,
			2
		),
	prefab: () => JSON.stringify({ prefabId: crypto.randomUUID(), components: [] }, null, 2),
	script: () => scriptContent,
	ui: () => '',
	dialog: () => `{
  "dialogues": [
    {
      "id": "new_dialogue_1",
      "pages": [
        {
          "speaker": "",
          "text": ""
        }
      ]
    }
  ]
}`,
};

export function useFileCreate() {
	const selectedFolder = useFolderStore((state) => state.selectedFolder);
	const currentProject = useProjectStore((state) => state.currentProject);
	const { tags, saveTags } = useEngineConfigStore();

	const [creatingFileType, setCreatingFileType] = useState<CreatableFileType | null>(null);
	const [newFileName, setNewFileName] = useState('');
	const inputRef = useRef<HTMLTextAreaElement>(null);

	const { notify } = useNotify();
	const { t } = useTranslation();

	useEffect(() => {
		const cleanup = window.api.onCreateFileInline((fileType) => {
			setCreatingFileType(fileType);
			setNewFileName('');
		});
		return cleanup;
	}, []);

	useEffect(() => {
		if (creatingFileType) {
			requestAnimationFrame(() => inputRef.current?.focus());
		}
	}, [creatingFileType]);

	const cancelCreation = () => {
		setCreatingFileType(null);
		setNewFileName('');
	};

	const addTag = (baseName: string, tagPath: string) => {
		if (!currentProject) return;
		saveTags(currentProject, { ...tags, [baseName]: tagPath });
	};

	const confirmCreation = async () => {
		const trimmed = newFileName.trim();
		if (!trimmed || !creatingFileType || !selectedFolder?.path || !currentProject) {
			cancelCreation();
			return;
		}

		const extension = FILE_EXTENSIONS[creatingFileType];
		const fileNameWithExt = trimmed.endsWith(extension) ? trimmed : trimmed + extension;
		const baseName = fileNameWithExt.slice(0, -extension.length);

		const projectPath = await window.api.pathUnion(currentProject.path, currentProject.name);
		const relativePath = await window.api.pathUnion(projectPath, selectedFolder.path);

		if (creatingFileType === 'ui') {
			const hiddenFolderName = `.${baseName}`;
			const hiddenFolderPath = await window.api.pathUnion(relativePath, hiddenFolderName);
			const hiddenFilePaths = await window.api.pathUnion(selectedFolder.path, hiddenFolderName);

			const htmlRelativePath = await window.api.pathUnion(hiddenFilePaths, `${baseName}_HTML.rmli`);
			const cssRelativePath = await window.api.pathUnion(hiddenFilePaths, `${baseName}_CSS.css`);

			const uiDescriptor = JSON.stringify(
				{
					htmlPath: htmlRelativePath,
					cssPath: cssRelativePath,
					scriptPath: null as string | null,
				},
				null,
				2
			);

			console.log(cssRelativePath);

			const saves: Array<{ name: string; path: string; content: string; label: string }> = [
				{
					name: fileNameWithExt,
					path: relativePath,
					content: uiDescriptor,
					label: '.ui descriptor',
				},
				{
					name: `${baseName}_HTML.rmli`,
					path: hiddenFolderPath,
					content: UI_HTML_DEFAULT_CONTENT(baseName, `${baseName}_CSS.css`),
					label: 'HTML markup',
				},
				{
					name: `${baseName}_CSS.css`,
					path: hiddenFolderPath,
					content: UI_CSS_DEFAULT_CONTENT(baseName),
					label: 'CSS stylesheet',
				},
			];

			for (const file of saves) {
				try {
					const result = await window.api.saveFileCompletePath(file.name, file.path, file.content);
					if (!result.success) {
						notify(
							t('engine.notifications.error_title'),
							result.error ?? `Failed to create ${file.label}`,
							'error'
						);
						cancelCreation();
						return;
					}
				} catch (error) {
					console.error(`[useFileCreate] Error saving ${file.label}:`, error);
					cancelCreation();
					return;
				}
			}
			const tagPath = await window.api.pathUnion(selectedFolder.path, fileNameWithExt);

			addTag(baseName, tagPath);
		} else {
			const content = FILE_DEFAULT_CONTENT[creatingFileType](currentProject.defaultTilesize || 16);

			try {
				const result = await window.api.saveFileCompletePath(
					fileNameWithExt,
					relativePath,
					content
				);
				if (!result.success) {
					notify(t('engine.notifications.error_title'), result.error ?? '', 'error');
				} else {
					const tagPath = await window.api.pathUnion(selectedFolder.path, fileNameWithExt);
					addTag(baseName, tagPath);
				}
			} catch (error) {
				console.error('[useFileCreate] Error saving file:', error);
			}
		}

		cancelCreation();
	};

	const handleCreateKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			await confirmCreation();
		} else if (e.key === 'Escape') {
			cancelCreation();
		}
	};

	return {
		creatingFileType,
		newFileName,
		setNewFileName,
		inputRef,
		cancelCreation,
		handleCreateKeyDown,
	};
}
