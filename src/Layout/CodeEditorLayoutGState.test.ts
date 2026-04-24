import { describe, it, expect, beforeEach } from 'vitest';
import { useCodeEditorLayoutStore, CODE_EDITOR_LIMITS } from './CodeEditorLayoutGState';

describe('useCodeEditorLayoutStore', () => {
	beforeEach(() => {
		useCodeEditorLayoutStore.getState().resetCodeEditorLayout();
	});

	it('should have correct default state', () => {
		const state = useCodeEditorLayoutStore.getState();
		expect(state.leftPanelWidth).toBe(650);
		expect(state.rightPanelWidth).toBe(500);
		expect(state.mapPreviewHeight).toBe(400);
		expect(state.mapPreviewZoom).toBe(1.25);
	});

	it('should resize left panel within limits', () => {
		const store = useCodeEditorLayoutStore.getState();

		store.resizeLeftPanel(50);
		expect(useCodeEditorLayoutStore.getState().leftPanelWidth).toBe(700);

		store.resizeLeftPanel(5000);
		expect(useCodeEditorLayoutStore.getState().leftPanelWidth).toBe(CODE_EDITOR_LIMITS.leftPanelWidth.max);

		store.resizeLeftPanel(-5000);
		expect(useCodeEditorLayoutStore.getState().leftPanelWidth).toBe(CODE_EDITOR_LIMITS.leftPanelWidth.min);
	});

	it('should resize right panel within limits', () => {
		const store = useCodeEditorLayoutStore.getState();

		store.resizeRightPanel(50);
		expect(useCodeEditorLayoutStore.getState().rightPanelWidth).toBe(450);

		store.resizeRightPanel(-5000);
		expect(useCodeEditorLayoutStore.getState().rightPanelWidth).toBe(CODE_EDITOR_LIMITS.rightPanelWidth.max);

		store.resizeRightPanel(5000);
		expect(useCodeEditorLayoutStore.getState().rightPanelWidth).toBe(CODE_EDITOR_LIMITS.rightPanelWidth.min);
	});

	it('should resize map preview within limits', () => {
		const store = useCodeEditorLayoutStore.getState();

		store.resizeMapPreview(50);
		expect(useCodeEditorLayoutStore.getState().mapPreviewHeight).toBe(450);

		store.resizeMapPreview(5000);
		expect(useCodeEditorLayoutStore.getState().mapPreviewHeight).toBe(
			CODE_EDITOR_LIMITS.mapPreviewHeight.max
		);

		store.resizeMapPreview(-5000);
		expect(useCodeEditorLayoutStore.getState().mapPreviewHeight).toBe(
			CODE_EDITOR_LIMITS.mapPreviewHeight.min
		);
	});

	it('should set map preview zoom within limits', () => {
		const store = useCodeEditorLayoutStore.getState();

		store.setMapPreviewZoom(2);
		expect(useCodeEditorLayoutStore.getState().mapPreviewZoom).toBe(2);

		store.setMapPreviewZoom(10);
		expect(useCodeEditorLayoutStore.getState().mapPreviewZoom).toBe(CODE_EDITOR_LIMITS.mapPreviewZoom.max);

		store.setMapPreviewZoom(0.1);
		expect(useCodeEditorLayoutStore.getState().mapPreviewZoom).toBe(CODE_EDITOR_LIMITS.mapPreviewZoom.min);
	});

	it('should reset layout to defaults', () => {
		const store = useCodeEditorLayoutStore.getState();

		store.resizeLeftPanel(100);
		store.resizeRightPanel(-100);
		store.resizeMapPreview(100);
		store.setMapPreviewZoom(3);

		store.resetCodeEditorLayout();

		const state = useCodeEditorLayoutStore.getState();
		expect(state.leftPanelWidth).toBe(650);
		expect(state.rightPanelWidth).toBe(500);
		expect(state.mapPreviewHeight).toBe(400);
		expect(state.mapPreviewZoom).toBe(1.25);
	});
});