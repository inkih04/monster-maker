import { create } from 'zustand';
import { temporal } from 'zundo';

export interface Choice {
	text: string;
	next_chain: string;
}

export interface Page {
	speaker: string;
	text: string;
	choices?: Choice[];
}

export interface Dialogue {
	id: string;
	pages: Page[];
}

export interface DialogueFileData {
	dialogues: Dialogue[];
}

interface DialogueState {
	dialogues: Dialogue[];
	currentFilePath: string | null;
	currentFolderPath: string | null;
	isLoading: boolean;
	isSaving: boolean;
	error: string | null;

	loadDialogues: (dialogues: Dialogue[], filePath: string, folderPath: string) => void;
	setLoading: (value: boolean) => void;
	setSaving: (value: boolean) => void;
	setError: (error: string | null) => void;

	updateDialogueId: (index: number, newId: string) => void;
	addDialogue: () => void;
	deleteDialogue: (index: number) => void;

	addPage: (dialogIndex: number) => void;
	updatePage: (dialogIndex: number, pageIndex: number, field: keyof Page, value: string) => void;
	deletePage: (dialogIndex: number, pageIndex: number) => void;

	addChoice: (dialogIndex: number, pageIndex: number) => void;
	updateChoice: (
		dialogIndex: number,
		pageIndex: number,
		choiceIndex: number,
		field: keyof Choice,
		value: string
	) => void;
	deleteChoice: (dialogIndex: number, pageIndex: number, choiceIndex: number) => void;

	clear: () => void;
}

let _onMutate: (() => void) | null = null;

export function registerDialogueSaveCallback(cb: () => void) {
	_onMutate = cb;
}

function triggerSave() {
	_onMutate?.();
}

export const useDialogueStore = create<DialogueState>()(
	temporal(
		(set) => ({
			dialogues: [],
			currentFilePath: null,
			currentFolderPath: null,
			isLoading: false,
			isSaving: false,
			error: null,

			loadDialogues: (dialogues, filePath, folderPath) => {
				set({ dialogues, currentFilePath: filePath, currentFolderPath: folderPath, error: null });
				useDialogueStore.temporal.getState().clear();
			},

			setLoading: (value) => set({ isLoading: value }),
			setSaving: (value) => set({ isSaving: value }),
			setError: (error) => set({ error }),

			updateDialogueId: (index, newId) => {
				set((s) => {
					const updated = [...s.dialogues];
					updated[index] = { ...updated[index], id: newId };
					return { dialogues: updated };
				});
				triggerSave();
			},

			addDialogue: () => {
				set((s) => {
					const newDialogue: Dialogue = {
						id: `new_dialogue_${s.dialogues.length + 1}`,
						pages: [{ speaker: '', text: '' }],
					};
					return { dialogues: [...s.dialogues, newDialogue] };
				});
				triggerSave();
			},

			deleteDialogue: (index) => {
				set((s) => {
					const updated = [...s.dialogues];
					updated.splice(index, 1);
					return { dialogues: updated };
				});
				triggerSave();
			},

			addPage: (dialogIndex) => {
				set((s) => {
					const updated = [...s.dialogues];
					updated[dialogIndex] = {
						...updated[dialogIndex],
						pages: [...updated[dialogIndex].pages, { speaker: '', text: '' }],
					};
					return { dialogues: updated };
				});
				triggerSave();
			},

			updatePage: (dialogIndex, pageIndex, field, value) => {
				set((s) => {
					const updated = [...s.dialogues];
					const pages = [...updated[dialogIndex].pages];
					pages[pageIndex] = { ...pages[pageIndex], [field]: value };
					updated[dialogIndex] = { ...updated[dialogIndex], pages };
					return { dialogues: updated };
				});
				triggerSave();
			},

			deletePage: (dialogIndex, pageIndex) => {
				set((s) => {
					const updated = [...s.dialogues];
					const pages = [...updated[dialogIndex].pages];
					pages.splice(pageIndex, 1);
					updated[dialogIndex] = { ...updated[dialogIndex], pages };
					return { dialogues: updated };
				});
				triggerSave();
			},

			addChoice: (dialogIndex, pageIndex) => {
				set((s) => {
					const updated = [...s.dialogues];
					const pages = [...updated[dialogIndex].pages];
					const choices = [...(pages[pageIndex].choices ?? []), { text: '', next_chain: '' }];
					pages[pageIndex] = { ...pages[pageIndex], choices };
					updated[dialogIndex] = { ...updated[dialogIndex], pages };
					return { dialogues: updated };
				});
				triggerSave();
			},

			updateChoice: (dialogIndex, pageIndex, choiceIndex, field, value) => {
				set((s) => {
					const updated = [...s.dialogues];
					const pages = [...updated[dialogIndex].pages];
					const choices = [...(pages[pageIndex].choices ?? [])];
					choices[choiceIndex] = { ...choices[choiceIndex], [field]: value };
					pages[pageIndex] = { ...pages[pageIndex], choices };
					updated[dialogIndex] = { ...updated[dialogIndex], pages };
					return { dialogues: updated };
				});
				triggerSave();
			},

			deleteChoice: (dialogIndex, pageIndex, choiceIndex) => {
				set((s) => {
					const updated = [...s.dialogues];
					const pages = [...updated[dialogIndex].pages];
					const choices = [...(pages[pageIndex].choices ?? [])];
					choices.splice(choiceIndex, 1);
					pages[pageIndex] = { ...pages[pageIndex], choices };
					updated[dialogIndex] = { ...updated[dialogIndex], pages };
					return { dialogues: updated };
				});
				triggerSave();
			},

			clear: () =>
				set({
					dialogues: [],
					currentFilePath: null,
					currentFolderPath: null,
					error: null,
				}),
		}),
		{
			limit: 60,
			partialize: (state) => ({ dialogues: state.dialogues }),
			equality: (past, current) => JSON.stringify(past) === JSON.stringify(current),
		}
	)
);
