/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useFileActions } from './useFileActions';
import { useProjectStore } from '../../Project/ProjectConfigGState';
import { useMapStore } from '../../Map/MapGState';
import { useFolderStore } from '../../common/globalStores/useFolderStore';
import { useTileSetStore } from '../../Tileset/TileSetGState';
import { useEngineStore } from '../../ToolBar/EngineGState';
import { useCodeEditorStore } from '../../CodeEditor/CodeEditorGState';
import { useDialogueStore } from '../../DialogEditor/DialogueGState';
import { useNotify } from '../../common/components/toast/ToastContext';
import { FileItem } from '../../../global/types/fileItem';

vi.mock('react-i18next', () => ({
	useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('../../Project/ProjectConfigGState', () => ({ useProjectStore: vi.fn() }));
vi.mock('../../Map/MapGState', () => ({ useMapStore: vi.fn() }));
vi.mock('../../common/globalStores/useFolderStore', () => ({ useFolderStore: vi.fn() }));
vi.mock('../../Tileset/TileSetGState', () => ({ useTileSetStore: vi.fn() }));
vi.mock('../../ToolBar/EngineGState', () => ({ useEngineStore: vi.fn() }));
vi.mock('../../CodeEditor/CodeEditorGState', () => ({ useCodeEditorStore: vi.fn() }));
vi.mock('../../DialogEditor/DialogueGState', () => ({ useDialogueStore: vi.fn() }));
vi.mock('../../common/components/toast/ToastContext', () => ({ useNotify: vi.fn() }));

const mockApiGetFile = vi.fn();
const mockApiDeleteFile = vi.fn();
const mockApiDeleteFolder = vi.fn();
const mockApiPathUnion = vi.fn();

(window as any).api = {
	getFile: mockApiGetFile,
	deleteFile: mockApiDeleteFile,
	deleteFolder: mockApiDeleteFolder,
	pathUnion: mockApiPathUnion,
};

describe('useFileActions', () => {
	const mockNotifyFn = vi.fn();
	
	const mockMapStore = {
		isDirty: false,
		loadMap: vi.fn(),
		setMapRelativePath: vi.fn(),
		createMap: vi.fn(),
	};

	const mockTileSetStore = {
		tilesets: {},
		addTileSet: vi.fn(),
		setCurrentTileSet: vi.fn(),
		removeTileSet: vi.fn(),
		openTileSizeDialog: vi.fn(),
	};

	const mockEngineStore = {
		translate: false,
		changeEditorMode: vi.fn(),
		changeCodeEditorMode: vi.fn(),
		changeTranslate: vi.fn(),
	};

	const mockCodeEditorStore = {
		openFile: null,
		openUiFile: null,
		setIsLoadingFile: vi.fn(),
		setOpenFile: vi.fn(),
		setOpenUiFile: vi.fn(),
	};

	const mockDialogueStore = {
		setLoading: vi.fn(),
		setError: vi.fn(),
		loadDialogues: vi.fn(),
	};

	beforeEach(() => {
		vi.clearAllMocks();

		(useNotify as any).mockReturnValue({ notify: mockNotifyFn });

		(useProjectStore as any).mockImplementation((selector: any) =>
			selector({ currentProject: { name: 'TestProj', path: '/proj', defaultTilesize: 16 } })
		);
		(useFolderStore as any).mockImplementation((selector: any) =>
			selector({ selectedFolder: { path: '/proj/folder' } })
		);
		(useMapStore as any).mockImplementation((selector: any) => selector(mockMapStore));
		(useTileSetStore as any).mockImplementation((selector: any) => selector(mockTileSetStore));
		(useEngineStore as any).mockImplementation((selector: any) => selector(mockEngineStore));
		(useCodeEditorStore as any).mockImplementation((selector: any) => selector(mockCodeEditorStore));
		(useDialogueStore as any).mockImplementation(() => mockDialogueStore);
		(useDialogueStore as any).getState = vi.fn(() => mockDialogueStore);
		(useCodeEditorStore as any).getState = vi.fn(() => mockCodeEditorStore);
		(useTileSetStore as any).getState = vi.fn(() => mockTileSetStore);

		mockApiPathUnion.mockImplementation(async (...args) => args.join('/'));
	});

	it('should provide default states', () => {
		const { result } = renderHook(() => useFileActions());
		expect(result.current.showDeleteConfirm).toBe(false);
		expect(result.current.showSaveConfirm).toBe(false);
		expect(result.current.fileToDelete).toBeNull();
		expect(result.current.fileToOpen).toBeNull();
	});

	it('should handle delete request and show confirm dialog', () => {
		const { result } = renderHook(() => useFileActions());
		const file: FileItem = { name: 'test', path: 'test.map', type: 'tilemap' };

		act(() => {
			result.current.handleDeleteRequest(file);
		});

		expect(result.current.fileToDelete).toEqual(file);
		expect(result.current.showDeleteConfirm).toBe(true);
		expect(mockNotifyFn).toHaveBeenCalledWith(
			'engine.notifications.warning_title',
			'engine.notifications.delete_map_warning',
			'error',
			4000
		);
	});

	it('should confirm delete for a tilemap', async () => {
		const { result } = renderHook(() => useFileActions());
		const file: FileItem = { name: 'test', path: 'test.map', type: 'tilemap' };

		act(() => {
			result.current.handleDeleteRequest(file);
		});

		await act(async () => {
			await result.current.handleConfirmDelete();
		});

		expect(mockApiDeleteFile).toHaveBeenCalledWith('test.map', '/proj/folder', expect.any(Object));
		expect(mockMapStore.createMap).toHaveBeenCalled();
		expect(mockNotifyFn).toHaveBeenCalled();
		expect(result.current.fileToDelete).toBeNull();
	});

	it('should try to open a tilemap when dirty', () => {
		(useMapStore as any).mockImplementation((selector: any) =>
			selector({ ...mockMapStore, isDirty: true })
		);
		const { result } = renderHook(() => useFileActions());
		const file: FileItem = { name: 'level1', path: 'level1.map', type: 'tilemap' };

		act(() => {
			result.current.tryOpenFile(file);
		});

		expect(result.current.showSaveConfirm).toBe(true);
	});

	it('should open a tilemap file', async () => {
		mockApiGetFile.mockResolvedValue({
			success: true,
			content: { content: '{"mapId":"123","width":10,"height":10,"entities":[]}', relativePath: 'level1.map' },
		});
		
		const { result } = renderHook(() => useFileActions());
		const file: FileItem = { name: 'level1', path: 'level1.map', type: 'tilemap' };

		await act(async () => {
			result.current.tryOpenFile(file);
		});

		expect(mockEngineStore.changeTranslate).toHaveBeenCalledWith(false);
		expect(mockMapStore.loadMap).toHaveBeenCalled();
		expect(mockMapStore.setMapRelativePath).toHaveBeenCalledWith('level1.map');
	});

	it('should open a script file', async () => {
		mockApiGetFile.mockResolvedValue({
			success: true,
			content: { content: 'console.log("test");' },
		});

		const { result } = renderHook(() => useFileActions());
		const file: FileItem = { name: 'script', path: 'script.ts', type: 'script' };

		await act(async () => {
			result.current.tryOpenFile(file);
		});

		expect(mockEngineStore.changeCodeEditorMode).toHaveBeenCalledWith('single');
		expect(mockEngineStore.changeEditorMode).toHaveBeenCalledWith('code');
		expect(mockCodeEditorStore.setOpenFile).toHaveBeenCalledWith('/proj/folder/script.ts', 'console.log("test");');
	});

	it('should open a ui file and fetch dependencies', async () => {
		mockApiGetFile.mockImplementation(async (path) => {
			if (path === 'ui.rmli') {
				return { success: true, content: { content: '{"htmlPath":"ui.html","cssPath":"ui.css","scriptPath":null}' } };
			}
			if (path === 'ui.html') {
				return { success: true, content: { content: '<div></div>' } };
			}
			if (path === 'ui.css') {
				return { success: true, content: { content: 'body {}' } };
			}
			return { success: false };
		});

		const { result } = renderHook(() => useFileActions());
		const file: FileItem = { name: 'ui', path: 'ui.rmli', type: 'ui' };

		await act(async () => {
			result.current.tryOpenFile(file);
		});

		expect(mockEngineStore.changeEditorMode).toHaveBeenCalledWith('code');
		expect(mockEngineStore.changeCodeEditorMode).toHaveBeenCalledWith('duo');
		expect(mockCodeEditorStore.setOpenUiFile).toHaveBeenCalledWith(
			'/proj/folder/ui.rmli',
			'ui.html',
			'ui.css',
			'<div></div>',
			'body {}',
			null
		);
	});

	it('should open a dialog file', async () => {
		mockApiGetFile.mockResolvedValue({
			success: true,
			content: { content: '{"dialogues": [{"id": "1", "pages": []}]}' },
		});

		const { result } = renderHook(() => useFileActions());
		const file: FileItem = { name: 'dialog', path: 'dialog.json', type: 'dialog' };

		await act(async () => {
			result.current.tryOpenFile(file);
		});

		expect(mockEngineStore.changeCodeEditorMode).toHaveBeenCalledWith('dialog');
		expect(mockEngineStore.changeEditorMode).toHaveBeenCalledWith('code');
		expect(mockDialogueStore.setLoading).toHaveBeenCalledWith(true);
		expect(mockDialogueStore.loadDialogues).toHaveBeenCalled();
		expect(mockDialogueStore.setLoading).toHaveBeenCalledWith(false);
	});
	
	it('should delete a script file and change editor mode', async () => {
		const { result } = renderHook(() => useFileActions());
		const file: FileItem = { name: 'test', path: 'test.ts', type: 'script' };

		act(() => {
			result.current.handleDeleteRequest(file);
		});

		await act(async () => {
			await result.current.handleConfirmDelete();
		});

		expect(mockEngineStore.changeCodeEditorMode).toHaveBeenCalledWith(null);
		expect(mockEngineStore.changeEditorMode).toHaveBeenCalledWith('map');
		expect(mockApiDeleteFile).toHaveBeenCalledWith('test.ts', '/proj/folder', expect.any(Object));
	});

	it('should delete a ui file and its hidden folder', async () => {
		const { result } = renderHook(() => useFileActions());
		const file: FileItem = { name: 'menu', path: 'menu.ui', type: 'ui' };

		act(() => {
			result.current.handleDeleteRequest(file);
		});

		await act(async () => {
			await result.current.handleConfirmDelete();
		});

		expect(mockApiDeleteFolder).toHaveBeenCalled();
		expect(mockApiDeleteFile).toHaveBeenCalledWith('menu.ui', '/proj/folder', expect.any(Object));
	});
});