import { create } from 'zustand';

type RunMode = 'play' | 'debug' | null;
type EditorMode = 'map' | 'code' | null;
type CodeEditorMode = 'single' | 'duo' | null;

interface EngineStore {
	isRunning: boolean;
	runMode: RunMode;
	editorMode: EditorMode;
	codeEditorMode: CodeEditorMode;

	changeCodeEditorMode: (mode: CodeEditorMode) => void;
	changeEditorMode: (mode: EditorMode) => void;
	startEngine: (mode: 'play' | 'debug', mapPath?: string) => void;
	stopEngine: () => void;
	setEngineRunning: (running: boolean) => void;
	resetEngineState: () => void;
	reset: () => void;
}

export const useEngineStore = create<EngineStore>((set) => ({
	isRunning: false,
	runMode: null,
	editorMode: 'map',
	codeEditorMode: null,

	changeCodeEditorMode(mode) {
		set({ codeEditorMode: mode });
	},

	changeEditorMode(mode) {
		set({ editorMode: mode });
	},
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
	reset: () => {
		set({ isRunning: false, runMode: null, editorMode: 'map', codeEditorMode: null });
		console.log('Engine state reset');
	},
}));
