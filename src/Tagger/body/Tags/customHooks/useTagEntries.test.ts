/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useTagEntries } from './useTagEntries';
import { useProjectStore } from '../../../../Project/ProjectConfigGState';
import { useFolderStore } from '../../../../common/globalStores/useFolderStore';
import { useEngineConfigStore } from '../../../useEngineConfigStore';

vi.mock('../../../../Project/ProjectConfigGState', () => ({
	useProjectStore: vi.fn(),
}));

vi.mock('../../../../common/globalStores/useFolderStore', () => ({
	useFolderStore: vi.fn(),
}));

vi.mock('../../../useEngineConfigStore', () => ({
	useEngineConfigStore: vi.fn(),
}));

const mockPathUnion = vi.fn();
(window as any).api = {
	pathUnion: mockPathUnion,
};

describe('useTagEntries', () => {
	const mockProject = { id: 'test_project' };
	const mockFolder = { path: '/root/folder' };

	const mockLoadEngineConfig = vi.fn();
	const mockSaveTags = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();

		(useProjectStore as any).mockImplementation((selector: any) =>
			selector({ currentProject: mockProject })
		);

		(useFolderStore as any).mockImplementation((selector: any) =>
			selector({ selectedFolder: mockFolder })
		);

		(useEngineConfigStore as any).mockReturnValue({
			tags: { player: '/path/to/player.png' },
			isLoading: false,
			loadEngineConfig: mockLoadEngineConfig,
			saveTags: mockSaveTags,
		});

		vi.stubGlobal('crypto', {
			randomUUID: () => Math.random().toString(36).substring(7),
		});
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('should load engine config on mount', () => {
		renderHook(() => useTagEntries());
		expect(mockLoadEngineConfig).toHaveBeenCalledWith(mockProject);
	});

	it('should initialize entries from tags', () => {
		const { result } = renderHook(() => useTagEntries());
		
		expect(result.current.entries.length).toBe(1);
		expect(result.current.entries[0].tag).toBe('player');
		expect(result.current.entries[0].path).toBe('/path/to/player.png');
	});

	it('should initialize with an empty entry if tags are empty', () => {
		(useEngineConfigStore as any).mockReturnValue({
			tags: {},
			isLoading: false,
			loadEngineConfig: mockLoadEngineConfig,
			saveTags: mockSaveTags,
		});

		const { result } = renderHook(() => useTagEntries());
		
		expect(result.current.entries.length).toBe(1);
		expect(result.current.entries[0].tag).toBe('');
		expect(result.current.entries[0].path).toBe('');
	});

	it('should add a new empty entry', () => {
		const { result } = renderHook(() => useTagEntries());

		act(() => {
			result.current.handleAdd();
		});

		expect(result.current.entries.length).toBe(2);
		expect(result.current.entries[1].tag).toBe('');
		expect(result.current.entries[1].path).toBe('');
	});

	it('should update a tag and persist', () => {
		const { result } = renderHook(() => useTagEntries());
		const entryId = result.current.entries[0].id;

		act(() => {
			result.current.handleTagChange(entryId, 'enemy');
		});

		expect(result.current.entries[0].tag).toBe('enemy');
		expect(mockSaveTags).toHaveBeenCalledWith(mockProject, { enemy: '/path/to/player.png' });
	});

	it('should update a path and persist', () => {
		const { result } = renderHook(() => useTagEntries());
		const entryId = result.current.entries[0].id;

		act(() => {
			result.current.handlePathChange(entryId, '/new/path.png');
		});

		expect(result.current.entries[0].path).toBe('/new/path.png');
		expect(mockSaveTags).toHaveBeenCalledWith(mockProject, { player: '/new/path.png' });
	});

	it('should remove an entry and persist', () => {
		const { result } = renderHook(() => useTagEntries());
		const entryId = result.current.entries[0].id;

		act(() => {
			result.current.handleRemove(entryId);
		});

		expect(result.current.entries.length).toBe(0);
		expect(mockSaveTags).toHaveBeenCalledWith(mockProject, {});
	});

	it('should handle drag over successfully if it contains a file', () => {
		const { result } = renderHook(() => useTagEntries());
		const entryId = result.current.entries[0].id;

		const mockEvent = {
			preventDefault: vi.fn(),
			stopPropagation: vi.fn(),
			dataTransfer: {
				types: ['file-type/image'],
			},
		} as unknown as React.DragEvent;

		act(() => {
			result.current.handleDragOver(mockEvent, entryId);
		});

		expect(mockEvent.preventDefault).toHaveBeenCalled();
		expect(mockEvent.stopPropagation).toHaveBeenCalled();
		expect(result.current.dragOverId).toBe(entryId);
	});

	it('should ignore drag over if it does not contain a file', () => {
		const { result } = renderHook(() => useTagEntries());
		const entryId = result.current.entries[0].id;

		const mockEvent = {
			preventDefault: vi.fn(),
			stopPropagation: vi.fn(),
			dataTransfer: {
				types: ['text/plain'],
			},
		} as unknown as React.DragEvent;

		act(() => {
			result.current.handleDragOver(mockEvent, entryId);
		});

		expect(result.current.dragOverId).toBeNull();
	});

	it('should handle drag leave', () => {
		const { result } = renderHook(() => useTagEntries());
		
		act(() => {
			result.current.handleDragLeave();
		});

		expect(result.current.dragOverId).toBeNull();
	});

	it('should handle file drop and update path', async () => {
		mockPathUnion.mockResolvedValue('/root/folder/dropped_file.png');
		
		const { result } = renderHook(() => useTagEntries());
		const entryId = result.current.entries[0].id;

		const mockEvent = {
			preventDefault: vi.fn(),
			stopPropagation: vi.fn(),
			dataTransfer: {
				getData: vi.fn().mockReturnValue(JSON.stringify({ path: 'dropped_file.png' })),
			},
		} as unknown as React.DragEvent;

		await act(async () => {
			await result.current.handleDrop(mockEvent, entryId);
		});

		expect(mockEvent.preventDefault).toHaveBeenCalled();
		expect(mockEvent.stopPropagation).toHaveBeenCalled();
		expect(mockPathUnion).toHaveBeenCalledWith('/root/folder', 'dropped_file.png');
		expect(result.current.entries[0].path).toBe('/root/folder/dropped_file.png');
		expect(mockSaveTags).toHaveBeenCalledWith(mockProject, { player: '/root/folder/dropped_file.png' });
		expect(result.current.dragOverId).toBeNull();
	});
});