/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useDialogEditor } from './useDialogEditor';
import { useDialogueStore, registerDialogueSaveCallback } from './DialogueGState';
import { useProjectStore } from '../Project/ProjectConfigGState';
import { useFolderStore } from '../common/globalStores/useFolderStore';

const mockStore = {
	dialogues: [{ id: 'test_dialogue', pages: [{ speaker: 'NPC', text: 'Hello' }] }],
	currentFilePath: '/mock/folder/file.json',
	currentFolderPath: '/mock/folder',
	isLoading: false,
	isSaving: false,
	error: null,
	loadDialogues: vi.fn(),
	setLoading: vi.fn(),
	setSaving: vi.fn(),
	setError: vi.fn(),
	updateDialogueId: vi.fn(),
	addDialogue: vi.fn(),
	deleteDialogue: vi.fn(),
	addPage: vi.fn(),
	updatePage: vi.fn(),
	deletePage: vi.fn(),
	addChoice: vi.fn(),
	updateChoice: vi.fn(),
	deleteChoice: vi.fn(),
};

vi.mock('./DialogueGState', () => {
	const useDialogueStoreMock = vi.fn(() => mockStore);
	(useDialogueStoreMock as any).getState = vi.fn(() => mockStore);

	return {
		useDialogueStore: useDialogueStoreMock,
		registerDialogueSaveCallback: vi.fn(),
	};
});

vi.mock('../Project/ProjectConfigGState', () => ({
	useProjectStore: vi.fn(),
}));

vi.mock('../common/globalStores/useFolderStore', () => ({
	useFolderStore: vi.fn(),
}));

const mockGetFile = vi.fn();
const mockSaveFile = vi.fn();
const mockPathUnion = vi.fn();

(window as any).api = {
	getFile: mockGetFile,
	saveFile: mockSaveFile,
	pathUnion: mockPathUnion,
};

describe('useDialogEditor', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.useFakeTimers();

		(useProjectStore as any).mockImplementation((selector: any) =>
			selector({ currentProject: { id: 'mock_project' } })
		);
		(useFolderStore as any).mockImplementation((selector: any) =>
			selector({ selectedFolder: { path: '/mock/folder' } })
		);
	});

	afterEach(() => {
		vi.runOnlyPendingTimers();
		vi.useRealTimers();
	});

	it('should provide initial states and functions', () => {
		const { result } = renderHook(() => useDialogEditor());

		expect(result.current.dialogues).toEqual(mockStore.dialogues);
		expect(result.current.currentFilePath).toBe(mockStore.currentFilePath);
		expect(result.current.editingIdIndex).toBeNull();
		expect(result.current.focusedPageIndex).toBeNull();
		expect(typeof result.current.loadDialogFile).toBe('function');
	});

	it('should register and cleanup save callback', () => {
		const { unmount } = renderHook(() => useDialogEditor());

		expect(registerDialogueSaveCallback).toHaveBeenCalledTimes(1);

		unmount();

		expect(registerDialogueSaveCallback).toHaveBeenCalledTimes(2);
	});

	it('should successfully load a dialog file', async () => {
		mockGetFile.mockResolvedValue({
			success: true,
			content: { content: '{"dialogues": []}' },
		});
		mockPathUnion.mockResolvedValue('/mock/folder/test.json');

		const { result } = renderHook(() => useDialogEditor());

		await act(async () => {
			await result.current.loadDialogFile({ path: 'test.json' } as any);
		});

		expect(mockStore.setLoading).toHaveBeenCalledWith(true);
		expect(mockStore.setError).toHaveBeenCalledWith(null);
		expect(mockGetFile).toHaveBeenCalledWith('test.json', '/mock/folder', { id: 'mock_project' });
		expect(mockPathUnion).toHaveBeenCalledWith('/mock/folder', 'test.json');
		expect(mockStore.loadDialogues).toHaveBeenCalledWith([], '/mock/folder/test.json', '/mock/folder');
		expect(mockStore.setLoading).toHaveBeenCalledWith(false);
	});

	it('should handle file load errors', async () => {
		mockGetFile.mockResolvedValue({
			success: false,
			error: 'File not found',
		});

		const { result } = renderHook(() => useDialogEditor());

		await act(async () => {
			await result.current.loadDialogFile({ path: 'invalid.json' } as any);
		});

		expect(mockStore.setError).toHaveBeenCalledWith('File not found');
		expect(mockStore.setLoading).toHaveBeenCalledWith(false);
	});

	it('should handle missing folder or project during load', async () => {
		(useProjectStore as any).mockImplementation((selector: any) => selector({ currentProject: null }));

		const { result } = renderHook(() => useDialogEditor());

		await act(async () => {
			await result.current.loadDialogFile({ path: 'test.json' } as any);
		});

		expect(mockStore.setLoading).not.toHaveBeenCalled();
		expect(mockGetFile).not.toHaveBeenCalled();
	});

	it('should add a new dialogue and set editing index', () => {
		const { result } = renderHook(() => useDialogEditor());

		act(() => {
			result.current.handleAddDialogue();
		});

		expect(mockStore.addDialogue).toHaveBeenCalled();
		expect(result.current.editingIdIndex).toBe(0);
	});

	it('should add a new page and set focused page index', () => {
		const { result } = renderHook(() => useDialogEditor());

		act(() => {
			result.current.handleAddPage(0);
		});

		expect(mockStore.addPage).toHaveBeenCalledWith(0);
		expect(result.current.focusedPageIndex).toEqual({ dialogIndex: 0, pageIndex: 0 });
	});

	it('should debounce save operations', async () => {
		let triggerSave: any;
		(registerDialogueSaveCallback as any).mockImplementation((cb: any) => {
			triggerSave = cb;
		});

		mockSaveFile.mockResolvedValue({ success: true });

		renderHook(() => useDialogEditor());

		act(() => {
			triggerSave();
			triggerSave();
			triggerSave();
		});

		expect(mockStore.setSaving).not.toHaveBeenCalled();
		expect(mockSaveFile).not.toHaveBeenCalled();

		await act(async () => {
			vi.advanceTimersByTime(600);
		});

		expect(mockStore.setSaving).toHaveBeenCalledWith(true);
		expect(mockSaveFile).toHaveBeenCalledWith(
			'/mock/folder/file.json',
			JSON.stringify({ dialogues: mockStore.dialogues }, null, 2),
			{ id: 'mock_project' }
		);
		expect(mockStore.setSaving).toHaveBeenCalledWith(false);
	});

	it('should handle save errors gracefully', async () => {
		let triggerSave: any;
		(registerDialogueSaveCallback as any).mockImplementation((cb: any) => {
			triggerSave = cb;
		});

		mockSaveFile.mockRejectedValue(new Error('Write permission denied'));

		renderHook(() => useDialogEditor());

		act(() => {
			triggerSave();
		});

		await act(async () => {
			vi.advanceTimersByTime(600);
		});

		expect(mockStore.setSaving).toHaveBeenCalledWith(true);
		expect(mockStore.setError).toHaveBeenCalledWith('Error: Write permission denied');
		expect(mockStore.setSaving).toHaveBeenCalledWith(false);
	});
});