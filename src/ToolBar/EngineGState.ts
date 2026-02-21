import { create } from 'zustand';

type RunMode = 'play' | 'debug' | null;

interface EngineStore {
	isRunning: boolean;
	runMode: RunMode;
	
	startEngine: (mode: 'play' | 'debug', mapPath?: string) => void;
	stopEngine: () => void;
	setEngineRunning: (running: boolean) => void;
	resetEngineState: () => void;
}

export const useEngineStore = create<EngineStore>((set) => ({
	isRunning: false,
	runMode: null,

	startEngine: (mode, mapPath) => {
		set({ isRunning: true, runMode: mode });
		console.log(`Engine starting in ${mode} mode`, mapPath ? `with map: ${mapPath}` : '');
	},

	stopEngine: () => {
		set({ isRunning: false, runMode: null });
		console.log('Stopping engine...');
	},

	setEngineRunning: (running) => {
		if (!running) {
			set({ isRunning: false, runMode: null });
		} else {
			set({ isRunning: running });
		}
	},

	resetEngineState: () => {
		set({ isRunning: false, runMode: null });
		console.log('Engine state reset');
	},
}));