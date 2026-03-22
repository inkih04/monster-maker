import { create } from 'zustand';
import { ProjectData } from '../../global/types/projectData';
import {
	ShaderMap,
	TagMap,
	GameConfig,
	DEFAULT_GAME_CONFIG,
} from '../../global/types/engineConfig';

interface EngineConfigState {
	shaders: ShaderMap;
	tags: TagMap;
	gameConfig: GameConfig;
	isLoading: boolean;
	error: string | null;
}

interface EngineConfigActions {
	loadEngineConfig: (pd: ProjectData) => Promise<void>;
	saveShaders: (pd: ProjectData, shaders: ShaderMap) => Promise<void>;
	saveTags: (pd: ProjectData, tags: TagMap) => Promise<void>;
	saveGameConfig: (pd: ProjectData, gameConfig: GameConfig) => Promise<void>;
	reset: () => void;
}

const INITIAL_STATE: EngineConfigState = {
	shaders: {},
	tags: {},
	gameConfig: { ...DEFAULT_GAME_CONFIG },
	isLoading: false,
	error: null,
};

export const useEngineConfigStore = create<EngineConfigState & EngineConfigActions>((set) => ({
	...INITIAL_STATE,

	loadEngineConfig: async (pd: ProjectData) => {
		set({ isLoading: true, error: null });
		try {
			const result = await window.api.getEngineConfig(pd);
			if (result.success && result.config) {
				set({
					shaders: result.config.shaders,
					tags: result.config.tags ?? {},
					gameConfig: result.config.gameConfig ?? { ...DEFAULT_GAME_CONFIG },
					isLoading: false,
				});
			} else {
				set({ error: result.error ?? 'Failed to load engine config', isLoading: false });
			}
		} catch (err) {
			set({ error: String(err), isLoading: false });
		}
	},

	saveShaders: async (pd: ProjectData, shaders: ShaderMap) => {
		set({ shaders, error: null });
		try {
			const result = await window.api.updateShaders(pd, shaders);
			if (!result.success) {
				set({ error: result.error ?? 'Failed to save shaders' });
			}
		} catch (err) {
			set({ error: String(err) });
		}
	},

	saveTags: async (pd: ProjectData, tags: TagMap) => {
		set({ tags, error: null });
		try {
			const result = await window.api.updateTags(pd, tags);
			if (!result.success) {
				set({ error: result.error ?? 'Failed to save tags' });
			}
		} catch (err) {
			set({ error: String(err) });
		}
	},

	saveGameConfig: async (pd: ProjectData, gameConfig: GameConfig) => {
		set({ gameConfig, error: null });
		try {
			const result = await window.api.updateGameConfig(pd, gameConfig);
			if (!result.success) {
				set({ error: result.error ?? 'Failed to save game config' });
			}
		} catch (err) {
			set({ error: String(err) });
		}
	},

	reset: () => set(INITIAL_STATE),
}));
