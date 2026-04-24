import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useEngineStore } from './EngineGState';

describe('useEngineStore', () => {
	beforeEach(() => {
		useEngineStore.getState().reset();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('should have correct initial state', () => {
		const state = useEngineStore.getState();
		expect(state.isRunning).toBe(false);
		expect(state.runMode).toBeNull();
		expect(state.editorMode).toBe('map');
		expect(state.codeEditorMode).toBeNull();
		expect(state.translate).toBe(false);
		expect(state.paused).toBe(false);
	});

	it('should change code editor mode', () => {
		useEngineStore.getState().changeCodeEditorMode('single');
		expect(useEngineStore.getState().codeEditorMode).toBe('single');

		useEngineStore.getState().changeCodeEditorMode(null);
		expect(useEngineStore.getState().codeEditorMode).toBeNull();
	});

	it('should change paused state', () => {
		useEngineStore.getState().chagePaused(true); 
		expect(useEngineStore.getState().paused).toBe(true);

		useEngineStore.getState().chagePaused(false);
		expect(useEngineStore.getState().paused).toBe(false);
	});

	it('should change translate state', () => {
		useEngineStore.getState().changeTranslate(true);
		expect(useEngineStore.getState().translate).toBe(true);

		useEngineStore.getState().changeTranslate(false);
		expect(useEngineStore.getState().translate).toBe(false);
	});

	it('should change editor mode', () => {
		useEngineStore.getState().changeEditorMode('code');
		expect(useEngineStore.getState().editorMode).toBe('code');

		useEngineStore.getState().changeEditorMode(null);
		expect(useEngineStore.getState().editorMode).toBeNull();
	});

	it('should start engine and log with map path', () => {
		const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

		useEngineStore.getState().startEngine('play', '/maps/level1.json');

		const state = useEngineStore.getState();
		expect(state.isRunning).toBe(true);
		expect(state.runMode).toBe('play');
		expect(consoleSpy).toHaveBeenCalledWith(
			'Engine starting in play mode',
			'with map: /maps/level1.json'
		);
	});

	it('should start engine and log without map path', () => {
		const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

		useEngineStore.getState().startEngine('debug');

		const state = useEngineStore.getState();
		expect(state.isRunning).toBe(true);
		expect(state.runMode).toBe('debug');
		expect(consoleSpy).toHaveBeenCalledWith('Engine starting in debug mode', '');
	});

	it('should stop engine', () => {
		useEngineStore.setState({ isRunning: true, runMode: 'debug' });
		const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

		useEngineStore.getState().stopEngine();

		const state = useEngineStore.getState();
		expect(state.isRunning).toBe(false);
		expect(state.runMode).toBeNull();
		expect(consoleSpy).toHaveBeenCalledWith('Stopping engine...');
	});

	it('should set engine running state to true', () => {
		useEngineStore.getState().setEngineRunning(true);
		expect(useEngineStore.getState().isRunning).toBe(true);
	});

	it('should set engine running state to false and reset runMode', () => {
		useEngineStore.setState({ isRunning: true, runMode: 'play' });

		useEngineStore.getState().setEngineRunning(false);

		const state = useEngineStore.getState();
		expect(state.isRunning).toBe(false);
		expect(state.runMode).toBeNull();
	});

	it('should partially reset engine state via resetEngineState', () => {
		useEngineStore.setState({ isRunning: true, runMode: 'play', paused: true });
		const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

		useEngineStore.getState().resetEngineState();

		const state = useEngineStore.getState();
		expect(state.isRunning).toBe(false);
		expect(state.runMode).toBeNull();
		expect(state.paused).toBe(false);
		expect(consoleSpy).toHaveBeenCalledWith('Engine state reset');
	});

	it('should completely reset store state via reset', () => {
		useEngineStore.setState({
			isRunning: true,
			runMode: 'debug',
			editorMode: 'code',
			translate: true,
			codeEditorMode: 'json',
			paused: true,
		});
		const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

		useEngineStore.getState().reset();

		const state = useEngineStore.getState();
		expect(state.isRunning).toBe(false);
		expect(state.runMode).toBeNull();
		expect(state.editorMode).toBe('map');
		expect(state.translate).toBe(false);
		expect(state.codeEditorMode).toBeNull();
		expect(state.paused).toBe(false);
		expect(consoleSpy).toHaveBeenCalledWith('Engine state reset');
	});
});