import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useDialogueStore, registerDialogueSaveCallback, Dialogue } from './DialogueGState';

describe('useDialogueStore', () => {
	const mockSaveCallback = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		useDialogueStore.getState().clear();
		useDialogueStore.temporal.getState().clear();
		registerDialogueSaveCallback(mockSaveCallback);
	});

	it('should have initial state', () => {
		const state = useDialogueStore.getState();
		expect(state.dialogues).toEqual([]);
		expect(state.currentFilePath).toBeNull();
		expect(state.currentFolderPath).toBeNull();
		expect(state.isLoading).toBe(false);
		expect(state.isSaving).toBe(false);
		expect(state.error).toBeNull();
	});

	it('should set loading, saving, and error states', () => {
		const store = useDialogueStore.getState();
		store.setLoading(true);
		store.setSaving(true);
		store.setError('Test error');

		const updatedState = useDialogueStore.getState();
		expect(updatedState.isLoading).toBe(true);
		expect(updatedState.isSaving).toBe(true);
		expect(updatedState.error).toBe('Test error');
	});

	it('should load dialogues and clear temporal history', () => {
		const mockDialogues: Dialogue[] = [{ id: '1', pages: [{ speaker: 'A', text: 'B' }] }];
		useDialogueStore.getState().loadDialogues(mockDialogues, '/path/file.json', '/path');

		const state = useDialogueStore.getState();
		expect(state.dialogues).toEqual(mockDialogues);
		expect(state.currentFilePath).toBe('/path/file.json');
		expect(state.currentFolderPath).toBe('/path');
		expect(useDialogueStore.temporal.getState().pastStates.length).toBe(0);
	});

	it('should add a dialogue and trigger save', () => {
		useDialogueStore.getState().addDialogue();
		const state = useDialogueStore.getState();

		expect(state.dialogues.length).toBe(1);
		expect(state.dialogues[0].id).toBe('new_dialogue_1');
		expect(state.dialogues[0].pages).toEqual([{ speaker: '', text: '' }]);
		expect(mockSaveCallback).toHaveBeenCalledTimes(1);
	});

	it('should update dialogue id', () => {
		const store = useDialogueStore.getState();
		store.addDialogue();
		store.updateDialogueId(0, 'custom_id');

		expect(useDialogueStore.getState().dialogues[0].id).toBe('custom_id');
		expect(mockSaveCallback).toHaveBeenCalledTimes(2);
	});

	it('should delete dialogue', () => {
		const store = useDialogueStore.getState();
		store.addDialogue();
		store.addDialogue();
		store.deleteDialogue(0);

		expect(useDialogueStore.getState().dialogues.length).toBe(1);
		expect(useDialogueStore.getState().dialogues[0].id).toBe('new_dialogue_2');
	});

	it('should add, update, and delete pages', () => {
		const store = useDialogueStore.getState();
		store.addDialogue();

		store.addPage(0);
		expect(useDialogueStore.getState().dialogues[0].pages.length).toBe(2);

		store.updatePage(0, 1, 'speaker', 'Hero');
		store.updatePage(0, 1, 'text', 'Hello!');
		expect(useDialogueStore.getState().dialogues[0].pages[1].speaker).toBe('Hero');
		expect(useDialogueStore.getState().dialogues[0].pages[1].text).toBe('Hello!');

		store.deletePage(0, 0);
		expect(useDialogueStore.getState().dialogues[0].pages.length).toBe(1);
		expect(useDialogueStore.getState().dialogues[0].pages[0].speaker).toBe('Hero');
	});

	it('should add, update, and delete choices', () => {
		const store = useDialogueStore.getState();
		store.addDialogue();

		store.addChoice(0, 0);
		expect(useDialogueStore.getState().dialogues[0].pages[0].choices?.length).toBe(1);

		store.updateChoice(0, 0, 0, 'text', 'Yes');
		store.updateChoice(0, 0, 0, 'next_chain', 'chain_2');
		expect(useDialogueStore.getState().dialogues[0].pages[0].choices?.[0]).toEqual({
			text: 'Yes',
			next_chain: 'chain_2',
		});

		store.deleteChoice(0, 0, 0);
		expect(useDialogueStore.getState().dialogues[0].pages[0].choices?.length).toBe(0);
	});

	it('should record temporal history for dialogues', () => {
		const store = useDialogueStore.getState();

		store.addDialogue();
		store.addDialogue();

		const temporalState = useDialogueStore.temporal.getState();
		expect(temporalState.pastStates.length).toBeGreaterThan(0);

		temporalState.undo();
		expect(useDialogueStore.getState().dialogues.length).toBe(1);

		temporalState.redo();
		expect(useDialogueStore.getState().dialogues.length).toBe(2);
	});
});
