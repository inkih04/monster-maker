import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useLocalizationStore } from './LocalizationGState';
import { ProjectData } from '../../global/types/projectData';

const mockPathUnion = vi.fn((...args) => Promise.resolve(args.join('/')));
const mockGetFilesInFolder = vi.fn();
const mockGetFile = vi.fn();
const mockSaveFile = vi.fn();
const mockDeleteFile = vi.fn();
const mockSaveLocalFile = vi.fn();
const mockImportLocalFile = vi.fn();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).api = {
	pathUnion: mockPathUnion,
	getFilesInFolder: mockGetFilesInFolder,
	getFile: mockGetFile,
	saveFile: mockSaveFile,
	deleteFile: mockDeleteFile,
	saveLocalFile: mockSaveLocalFile,
	importLocalFile: mockImportLocalFile,
};

const mockPd = {} as ProjectData;

describe('useLocalizationStore', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		useLocalizationStore.setState({
			data: [],
			languages: [],
			isLoading: false,
			isSaving: false,
			error: null,
		});
	});

	it('should have initial state', () => {
		const state = useLocalizationStore.getState();
		expect(state.data).toEqual([]);
		expect(state.languages).toEqual([]);
		expect(state.isLoading).toBe(false);
		expect(state.error).toBeNull();
	});

	it('should add a row', () => {
		useLocalizationStore.setState({ languages: ['en', 'es'] });
		useLocalizationStore.getState().addRow();

		const state = useLocalizationStore.getState();
		expect(state.data.length).toBe(1);
		expect(state.data[0]).toEqual({ key: '', en: '', es: '' });
	});

	it('should delete a row', () => {
		useLocalizationStore.setState({
			data: [{ key: 'k1' }, { key: 'k2' }],
		});
		useLocalizationStore.getState().deleteRow(0);

		const state = useLocalizationStore.getState();
		expect(state.data.length).toBe(1);
		expect(state.data[0].key).toBe('k2');
	});

	it('should update a cell', () => {
		useLocalizationStore.setState({
			data: [{ key: 'hello', en: 'Hello' }],
		});
		useLocalizationStore.getState().updateCell(0, 'en', 'Hi');

		expect(useLocalizationStore.getState().data[0].en).toBe('Hi');
	});

	it('should add a language', () => {
		useLocalizationStore.setState({ data: [{ key: 'k1', en: 'v1' }] });
		useLocalizationStore.getState().addLanguage();

		const state = useLocalizationStore.getState();
		expect(state.languages.length).toBe(1);
		expect(state.languages[0]).toMatch(/^new_/);
		expect(state.data[0][state.languages[0]]).toBe('');
	});

	it('should load localization data', async () => {
		mockGetFilesInFolder.mockResolvedValue({
			success: true,
			files: ['en.local', 'es.local', 'invalid.txt'],
		});

		mockGetFile.mockImplementation(async (fileName) => {
			if (fileName === 'en.local') {
				return { success: true, content: { content: '{"hello":"Hello"}' } };
			}
			if (fileName === 'es.local') {
				return { success: true, content: { content: '{"hello":"Hola"}' } };
			}
			return { success: false };
		});

		await useLocalizationStore.getState().loadLocalization(mockPd);

		const state = useLocalizationStore.getState();
		expect(state.languages).toContain('en');
		expect(state.languages).toContain('es');
		expect(state.data).toEqual([{ key: 'hello', en: 'Hello', es: 'Hola' }]);
		expect(state.isLoading).toBe(false);
	});

	it('should save all real languages', async () => {
		useLocalizationStore.setState({
			languages: ['en', 'new_123'],
			data: [{ key: 'hello', en: 'Hello', new_123: 'Test' }],
		});

		mockSaveFile.mockResolvedValue({ success: true });

		await useLocalizationStore.getState().saveAll(mockPd);

		expect(mockSaveFile).toHaveBeenCalledTimes(1);
		expect(mockSaveFile).toHaveBeenCalledWith(
			'resources/.locals/en.local',
			JSON.stringify({ hello: 'Hello' }, null, 2),
			mockPd
		);
		expect(useLocalizationStore.getState().isSaving).toBe(false);
	});

	it('should rename a language', async () => {
		useLocalizationStore.setState({
			languages: ['en'],
			data: [{ key: 'hello', en: 'Hello' }],
		});

		mockSaveFile.mockResolvedValue({ success: true });
		mockDeleteFile.mockResolvedValue({ success: true });

		const result = await useLocalizationStore.getState().renameLanguage('en', 'fr', mockPd);

		expect(result.success).toBe(true);
		const state = useLocalizationStore.getState();
		expect(state.languages).toEqual(['fr']);
		expect(state.data[0].fr).toBe('Hello');
		expect(mockDeleteFile).toHaveBeenCalledWith('en.local', 'resources/.locals', mockPd);
		expect(mockSaveFile).toHaveBeenCalled();
	});

	it('should delete a language', async () => {
		useLocalizationStore.setState({
			languages: ['en', 'es'],
			data: [{ key: 'hello', en: 'Hello', es: 'Hola' }],
		});

		mockDeleteFile.mockResolvedValue({ success: true });

		const result = await useLocalizationStore.getState().deleteLanguage('en', mockPd);

		expect(result.success).toBe(true);
		const state = useLocalizationStore.getState();
		expect(state.languages).toEqual(['es']);
		expect(state.data[0].en).toBeUndefined();
		expect(mockDeleteFile).toHaveBeenCalledWith('en.local', 'resources/.locals', mockPd);
	});

	it('should download language', async () => {
		useLocalizationStore.setState({
			data: [{ key: 'test', en: 'Test value' }],
		});

		await useLocalizationStore.getState().downloadLanguage('en');

		expect(mockSaveLocalFile).toHaveBeenCalledWith(
			'en.local',
			JSON.stringify({ test: 'Test value' }, null, 2)
		);
	});

	it('should import language', async () => {
		useLocalizationStore.setState({
			languages: ['en'],
			data: [{ key: 'existing', en: 'Old' }],
		});

		mockImportLocalFile.mockResolvedValue({
			success: true,
			content: '{"existing":"New", "added":"Value"}',
		});
		mockSaveFile.mockResolvedValue({ success: true });

		const result = await useLocalizationStore.getState().importLanguage('en', mockPd);

		expect(result.success).toBe(true);
		const state = useLocalizationStore.getState();
		expect(state.data.length).toBe(2);

		const existingRow = state.data.find((r) => r.key === 'existing');
		const addedRow = state.data.find((r) => r.key === 'added');

		expect(existingRow?.en).toBe('New');
		expect(addedRow?.en).toBe('Value');
	});
});