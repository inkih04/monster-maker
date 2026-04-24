import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useLocalizationTable } from './useLocalizationTable';

vi.mock('react-i18next', () => ({
	useTranslation: () => ({ t: (key: string) => key }),
}));

const mockLocalizationStore = {
	data: [],
	languages: [],
	isLoading: false,
	isSaving: false,
	loadLocalization: vi.fn(),
	saveAll: vi.fn(),
	updateCell: vi.fn(),
	renameLanguage: vi.fn(),
	addLanguage: vi.fn(),
	deleteLanguage: vi.fn(),
	addRow: vi.fn(),
	deleteRow: vi.fn(),
	downloadLanguage: vi.fn(),
	importLanguage: vi.fn(),
};

vi.mock('./LocalizationGState', () => ({
	useLocalizationStore: () => mockLocalizationStore,
}));

const mockProjectData = { id: 'test_project' };

vi.mock('../Project/ProjectConfigGState', () => ({
	useProjectStore: vi.fn((selector) => selector({ currentProject: mockProjectData })),
}));

const mockEngineConfigStore = {
	tags: { en: '/path/en.local' },
	saveTags: vi.fn(),
};

vi.mock('../Tagger/useEngineConfigStore', () => ({
	useEngineConfigStore: () => mockEngineConfigStore,
}));

const mockPathUnion = vi.fn();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).api = {
	pathUnion: mockPathUnion,
};

describe('useLocalizationTable', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		window.alert = vi.fn();
	});

	it('should provide default state and load localization on mount', () => {
		const { result } = renderHook(() => useLocalizationTable());

		expect(mockLocalizationStore.loadLocalization).toHaveBeenCalledWith(mockProjectData);
		expect(result.current.data).toEqual([]);
		expect(result.current.languages).toEqual([]);
		expect(result.current.globalFilter).toBe('');
		expect(result.current.columnVisibility).toEqual({});
	});

	it('should handle adding a language', () => {
		const { result } = renderHook(() => useLocalizationTable());

		act(() => {
			result.current.handleAddLanguage();
		});

		expect(mockLocalizationStore.addLanguage).toHaveBeenCalled();
	});

	it('should handle adding a word and clear filter', () => {
		const { result } = renderHook(() => useLocalizationTable());

		act(() => {
			result.current.setGlobalFilter('search_term');
		});

		act(() => {
			result.current.handleAddWord();
		});

		expect(mockLocalizationStore.addRow).toHaveBeenCalled();
		expect(result.current.globalFilter).toBe('');
	});

	it('should execute delete language and remove tag', async () => {
		const { result } = renderHook(() => useLocalizationTable());

		act(() => {
			result.current.setLanguageToDelete('en');
		});

		await act(async () => {
			await result.current.executeDeleteLanguage();
		});

		expect(mockLocalizationStore.deleteLanguage).toHaveBeenCalledWith('en', mockProjectData);
		expect(mockEngineConfigStore.saveTags).toHaveBeenCalledWith(mockProjectData, {});
		expect(result.current.languageToDelete).toBeNull();
	});

	it('should do nothing on executeDeleteLanguage if no language is selected', async () => {
		const { result } = renderHook(() => useLocalizationTable());

		await act(async () => {
			await result.current.executeDeleteLanguage();
		});

		expect(mockLocalizationStore.deleteLanguage).not.toHaveBeenCalled();
	});

	it('should execute delete row and save all', async () => {
		const { result } = renderHook(() => useLocalizationTable());

		act(() => {
			result.current.setRowToDelete({ index: 5, key: 'test_key' });
		});

		await act(async () => {
			await result.current.executeDeleteRow();
		});

		expect(mockLocalizationStore.deleteRow).toHaveBeenCalledWith(5);
		expect(mockLocalizationStore.saveAll).toHaveBeenCalledWith(mockProjectData);
		expect(result.current.rowToDelete).toBeNull();
	});

	it('should do nothing on executeDeleteRow if no row is selected', async () => {
		const { result } = renderHook(() => useLocalizationTable());

		await act(async () => {
			await result.current.executeDeleteRow();
		});

		expect(mockLocalizationStore.deleteRow).not.toHaveBeenCalled();
	});

	it('should handle rename language failure and alert user', async () => {
		mockLocalizationStore.renameLanguage.mockResolvedValue({
			success: false,
			error: 'Custom error',
		});

		const { result } = renderHook(() => useLocalizationTable());

		act(() => {
			result.current.renameLanguage('en', 'es');
		});

		await waitFor(() => {
			expect(mockLocalizationStore.renameLanguage).toHaveBeenCalledWith(
				'en',
				'es',
				mockProjectData
			);
			expect(window.alert).toHaveBeenCalledWith('localizationTable.langExistsAlert');
			expect(mockEngineConfigStore.saveTags).not.toHaveBeenCalled();
		});
	});
});
