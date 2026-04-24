import { useEffect, useRef, useState, useCallback } from 'react';
import { useDialogueStore, registerDialogueSaveCallback, DialogueFileData } from './DialogueGState';
import { useProjectStore } from '../Project/ProjectConfigGState';
import { useFolderStore } from '../common/globalStores/useFolderStore';
import { FileItem } from '../../global/types/fileItem';


const SAVE_DEBOUNCE_MS = 600;

export function useDialogEditor() {
	const currentProject = useProjectStore((s) => s.currentProject);
	const selectedFolder = useFolderStore((s) => s.selectedFolder);

	const {
		dialogues,
		currentFilePath,
		isLoading,
		isSaving,
		error,
		loadDialogues,
		setLoading,
		setSaving,
		setError,
		updateDialogueId,
		addDialogue,
		deleteDialogue,
		addPage,
		updatePage,
		deletePage,
		addChoice,
		updateChoice,
		deleteChoice,
	} = useDialogueStore();


	const [editingIdIndex, setEditingIdIndex] = useState<number | null>(null);
	const [focusedPageIndex, setFocusedPageIndex] = useState<{
		dialogIndex: number;
		pageIndex: number;
	} | null>(null);

	const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const persistToFile = useCallback(async () => {
		const { dialogues: current, currentFilePath: fp, currentFolderPath: folder } =
			useDialogueStore.getState();

		if (!fp || !folder || !currentProject) return;

		setSaving(true);
		try {
			const payload: DialogueFileData = { dialogues: current };
			const content = JSON.stringify(payload, null, 2);
			await window.api.saveFile(fp, content, currentProject);
		} catch (err) {
			setError(String(err));
		} finally {
			setSaving(false);
		}
	}, [currentProject, setSaving, setError]);

	const scheduleSave = useCallback(() => {
		if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
		saveTimerRef.current = setTimeout(() => {
			persistToFile();
		}, SAVE_DEBOUNCE_MS);
	}, [persistToFile]);

	useEffect(() => {
		registerDialogueSaveCallback(scheduleSave);
		return () => {
			registerDialogueSaveCallback(() => {});
			if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
		};
	}, [scheduleSave]);

	const loadDialogFile = useCallback(
		async (file: FileItem) => {
			if (!selectedFolder?.path || !currentProject) return;

			setLoading(true);
			setError(null);

			try {
				const result = await window.api.getFile(file.path, selectedFolder.path, currentProject);

				if (!result.success || !result.content) {
					setError(result.error ?? 'Failed to load dialogue file');
					return;
				}

				const parsed = JSON.parse(result.content.content) as DialogueFileData;
				const relativePath = await window.api.pathUnion(selectedFolder.path, file.path);

				loadDialogues(parsed.dialogues ?? [], relativePath, selectedFolder.path);
			} catch (err) {
				setError(String(err));
			} finally {
				setLoading(false);
			}
		},
		[currentProject, selectedFolder, loadDialogues, setLoading, setError]
	);

	const handleAddDialogue = useCallback(() => {
		addDialogue();
		setEditingIdIndex(useDialogueStore.getState().dialogues.length - 1);
	}, [addDialogue]);

	const handleAddPage = useCallback(
		(dialogIndex: number) => {
			addPage(dialogIndex);
			const pageCount = useDialogueStore.getState().dialogues[dialogIndex].pages.length;
			setFocusedPageIndex({ dialogIndex, pageIndex: pageCount - 1 });
		},
		[addPage]
	);

	return {
		dialogues,
		currentFilePath,
		isLoading,
		isSaving,
		error,
		editingIdIndex,
		focusedPageIndex,
		setEditingIdIndex,
		setFocusedPageIndex,
		loadDialogFile,
		updateDialogueId,
		handleAddDialogue,
		deleteDialogue,
		handleAddPage,
		updatePage,
		deletePage,
		addChoice,
		updateChoice,
		deleteChoice,
	};
}