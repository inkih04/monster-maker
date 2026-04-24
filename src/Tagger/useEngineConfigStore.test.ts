/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useEngineConfigStore } from './useEngineConfigStore';
import { ProjectData } from '../../global/types/projectData';

vi.mock('../../global/types/engineConfig', () => ({
	DEFAULT_GAME_CONFIG: {
		windowWidth: 800,
		windowHeight: 600,
		fullscreen: false,
	},
}));

const mockGetEngineConfig = vi.fn();
const mockUpdateShaders = vi.fn();
const mockUpdateTags = vi.fn();
const mockUpdateGameConfig = vi.fn();

(window as any).api = {
	getEngineConfig: mockGetEngineConfig,
	updateShaders: mockUpdateShaders,
	updateTags: mockUpdateTags,
	updateGameConfig: mockUpdateGameConfig,
};

describe('useEngineConfigStore', () => {
	const mockPd = { name: 'test_project' } as ProjectData;

	beforeEach(() => {
		vi.clearAllMocks();
		useEngineConfigStore.getState().reset();
	});

	it('should have correct initial state', () => {
		const state = useEngineConfigStore.getState();
		expect(state.shaders).toEqual({});
		expect(state.tags).toEqual({});
		expect(state.gameConfig).toEqual({
			windowWidth: 800,
			windowHeight: 600,
			fullscreen: false,
		});
		expect(state.isLoading).toBe(false);
		expect(state.error).toBeNull();
	});

	describe('loadEngineConfig', () => {
		it('should load config successfully', async () => {
			const mockConfig = {
				shaders: { default: 'shader_code' },
				tags: { player: 'tag_1' },
				gameConfig: { windowWidth: 1024, windowHeight: 768, fullscreen: true },
			};

			mockGetEngineConfig.mockResolvedValue({
				success: true,
				config: mockConfig,
			});

			await useEngineConfigStore.getState().loadEngineConfig(mockPd);

			const state = useEngineConfigStore.getState();
			expect(state.isLoading).toBe(false);
			expect(state.error).toBeNull();
			expect(state.shaders).toEqual(mockConfig.shaders);
			expect(state.tags).toEqual(mockConfig.tags);
			expect(state.gameConfig).toEqual(mockConfig.gameConfig);
			expect(mockGetEngineConfig).toHaveBeenCalledWith(mockPd);
		});

		it('should handle missing partial configs and use defaults', async () => {
			mockGetEngineConfig.mockResolvedValue({
				success: true,
				config: {
					shaders: { custom: 'code' },
				},
			});

			await useEngineConfigStore.getState().loadEngineConfig(mockPd);

			const state = useEngineConfigStore.getState();
			expect(state.tags).toEqual({});
			expect(state.gameConfig).toEqual({
				windowWidth: 800,
				windowHeight: 600,
				fullscreen: false,
			});
		});

		it('should handle load failure', async () => {
			mockGetEngineConfig.mockResolvedValue({
				success: false,
				error: 'Config not found',
			});

			await useEngineConfigStore.getState().loadEngineConfig(mockPd);

			const state = useEngineConfigStore.getState();
			expect(state.isLoading).toBe(false);
			expect(state.error).toBe('Config not found');
		});

		it('should handle load exceptions', async () => {
			mockGetEngineConfig.mockRejectedValue(new Error('Network error'));

			await useEngineConfigStore.getState().loadEngineConfig(mockPd);

			const state = useEngineConfigStore.getState();
			expect(state.isLoading).toBe(false);
			expect(state.error).toBe('Error: Network error');
		});
	});


	describe('saveTags', () => {
		it('should save tags successfully', async () => {
			mockUpdateTags.mockResolvedValue({ success: true });
			const newTags = { enemy: 'tag_2' };

			await useEngineConfigStore.getState().saveTags(mockPd, newTags);

			const state = useEngineConfigStore.getState();
			expect(state.tags).toEqual(newTags);
			expect(state.error).toBeNull();
			expect(mockUpdateTags).toHaveBeenCalledWith(mockPd, newTags);
		});

		it('should handle save tags failure', async () => {
			mockUpdateTags.mockResolvedValue({ success: false, error: 'Permission denied' });

			await useEngineConfigStore.getState().saveTags(mockPd, {});

			expect(useEngineConfigStore.getState().error).toBe('Permission denied');
		});
	});

	describe('saveGameConfig', () => {
		it('should save game config successfully', async () => {
			mockUpdateGameConfig.mockResolvedValue({ success: true });
			const newGameConfig = { windowWidth: 1920, windowHeight: 1080, fullscreen: true } as any;

			await useEngineConfigStore.getState().saveGameConfig(mockPd, newGameConfig);

			const state = useEngineConfigStore.getState();
			expect(state.gameConfig).toEqual(newGameConfig);
			expect(state.error).toBeNull();
			expect(mockUpdateGameConfig).toHaveBeenCalledWith(mockPd, newGameConfig);
		});

		it('should handle save game config failure', async () => {
			mockUpdateGameConfig.mockResolvedValue({ success: false, error: 'Disk full' });

			await useEngineConfigStore.getState().saveGameConfig(mockPd, {} as any);

			expect(useEngineConfigStore.getState().error).toBe('Disk full');
		});
	});

	describe('reset', () => {
		it('should restore initial state', () => {
			const store = useEngineConfigStore.getState();
			
			store.saveTags(mockPd, { test: 'value' });
			store.reset();

			const state = useEngineConfigStore.getState();
			expect(state.tags).toEqual({});
			expect(state.error).toBeNull();
		});
	});
});