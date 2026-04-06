import { useEffect, useRef, useState, useCallback } from 'react';
import { useDialogueStore, registerDialogueSaveCallback, DialogueFileData } from './DialogueGState';
import { useProjectStore } from '../Project/ProjectConfigGState';
import { useFolderStore } from '../common/globalStores/useFolderStore';
import { FileItem } from '../../global/types/fileItem';


// Debounce delay in ms — avoids hammering the FS on every keystroke
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
		// mutations — re-exported as-is so the component stays thin
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

	// ── UI-only state (not worth putting in the global store) ──────────────
	const [editingIdIndex, setEditingIdIndex] = useState<number | null>(null);
	const [focusedPageIndex, setFocusedPageIndex] = useState<{
		dialogIndex: number;
		pageIndex: number;
	} | null>(null);

	// ── Debounced save ─────────────────────────────────────────────────────
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

	// Register the save callback once so the store can call it after mutations
	useEffect(() => {
		registerDialogueSaveCallback(scheduleSave);
		return () => {
			registerDialogueSaveCallback(() => {});
			if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
		};
	}, [scheduleSave]);

	// ── Load file ──────────────────────────────────────────────────────────
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

	// ── Wrapped mutations that also manage local UI state ─────────────────
	const handleAddDialogue = useCallback(() => {
		addDialogue();
		// after addDialogue the new item is at the end; we want its id input focused
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
		// state
		dialogues,
		currentFilePath,
		isLoading,
		isSaving,
		error,
		editingIdIndex,
		focusedPageIndex,

		// setters for ui-only state
		setEditingIdIndex,
		setFocusedPageIndex,

		// file ops
		loadDialogFile,

		// mutations
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