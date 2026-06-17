/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useShaderEntries } from './useShaderEntries';
import { useProjectStore } from '../../../Project/ProjectConfigGState';
import { useEngineConfigStore } from '../../useEngineConfigStore';

vi.mock('../../../Project/ProjectConfigGState', () => ({
	useProjectStore: vi.fn(),
}));

vi.mock('../../useEngineConfigStore', () => ({
	useEngineConfigStore: vi.fn(),
}));

describe('useShaderEntries', () => {
	const mockProject = { id: 'test_project' };
	const mockLoadEngineConfig = vi.fn();
	const mockSaveShaders = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();

		let counter = 0;
		vi.stubGlobal('crypto', {
			randomUUID: () => `mock-uuid-${counter++}`,
		});

		(useProjectStore as any).mockImplementation((selector: any) =>
			selector({ currentProject: mockProject })
		);

		(useEngineConfigStore as any).mockReturnValue({
			shaders: { water: 1, lava: 2 },
			isLoading: false,
			loadEngineConfig: mockLoadEngineConfig,
			saveShaders: mockSaveShaders,
		});
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('should load engine config on mount', () => {
		renderHook(() => useShaderEntries());
		expect(mockLoadEngineConfig).toHaveBeenCalledWith(mockProject);
	});

	it('should initialize entries from store shaders', () => {
		const { result } = renderHook(() => useShaderEntries());

		expect(result.current.entries).toHaveLength(2);
		expect(result.current.entries[0]).toEqual({ id: expect.any(String), tag: 'water', mode: 1 });
		expect(result.current.entries[1]).toEqual({ id: expect.any(String), tag: 'lava', mode: 2 });
		expect(result.current.isLoading).toBe(false);
	});

	it('should add a new empty entry', () => {
		const { result } = renderHook(() => useShaderEntries());

		act(() => {
			result.current.handleAdd();
		});

		expect(result.current.entries).toHaveLength(3);
		expect(result.current.entries[2]).toEqual({ id: expect.any(String), tag: '', mode: '' });
	});

	it('should update a tag and persist', () => {
		const { result } = renderHook(() => useShaderEntries());
		const entryId = result.current.entries[0].id;

		act(() => {
			result.current.handleTagChange(entryId, 'ice');
		});

		expect(result.current.entries[0].tag).toBe('ice');
		expect(mockSaveShaders).toHaveBeenCalledWith(mockProject, { ice: 1, lava: 2 });
	});

	it('should update a mode with a valid number and persist', () => {
		const { result } = renderHook(() => useShaderEntries());
		const entryId = result.current.entries[0].id;

		act(() => {
			result.current.handleModeChange(entryId, '5');
		});

		expect(result.current.entries[0].mode).toBe(5);
		expect(mockSaveShaders).toHaveBeenCalledWith(mockProject, { water: 5, lava: 2 });
	});

	it('should update a mode to empty string and persist', () => {
		const { result } = renderHook(() => useShaderEntries());
		const entryId = result.current.entries[0].id;

		act(() => {
			result.current.handleModeChange(entryId, '');
		});

		expect(result.current.entries[0].mode).toBe('');
		expect(mockSaveShaders).toHaveBeenCalledWith(mockProject, { lava: 2 });
	});

	it('should ignore invalid number inputs for mode', () => {
		const { result } = renderHook(() => useShaderEntries());
		const entryId = result.current.entries[0].id;

		act(() => {
			result.current.handleModeChange(entryId, 'abc');
		});


		expect(result.current.entries[0].mode).toBe(1);
		expect(mockSaveShaders).not.toHaveBeenCalled();
	});

	it('should remove an entry and persist', () => {
		const { result } = renderHook(() => useShaderEntries());
		const entryId = result.current.entries[0].id;

		act(() => {
			result.current.handleRemove(entryId);
		});

		expect(result.current.entries).toHaveLength(1);
		expect(result.current.entries[0].tag).toBe('lava');
		expect(mockSaveShaders).toHaveBeenCalledWith(mockProject, { lava: 2 });
	});

	it('should sync entries when shaders from store change externally', () => {
		const { result, rerender } = renderHook(() => useShaderEntries());

		expect(result.current.entries).toHaveLength(2);

		(useEngineConfigStore as any).mockReturnValue({
			shaders: { wind: 3 },
			isLoading: false,
			loadEngineConfig: mockLoadEngineConfig,
			saveShaders: mockSaveShaders,
		});

		rerender();

		expect(result.current.entries).toHaveLength(1);
		expect(result.current.entries[0].tag).toBe('wind');
		expect(result.current.entries[0].mode).toBe(3);
	});
});
