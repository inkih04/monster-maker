
import { create } from 'zustand';
import { ProjectData } from '../../global/types/projectData';
import { ShaderMap } from '../../global/types/engineConfig';


interface EngineConfigState {
	shaders: ShaderMap;
	maps: Record<string, string>[];
	isLoading: boolean;
	error: string | null;
}

interface EngineConfigActions {
	loadEngineConfig: (pd: ProjectData) => Promise<void>;
	saveShaders: (pd: ProjectData, shaders: ShaderMap) => Promise<void>;
	reset: () => void;
}

const INITIAL_STATE: EngineConfigState = {
	shaders: {},
	maps: [],
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
					maps: result.config.maps,
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

	reset: () => set(INITIAL_STATE),
}));
