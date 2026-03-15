import { create } from 'zustand';

const DEFAULTS = {
	leftPanelWidth: 500,
	rightPanelWidth: 500,
	mapPreviewHeight: 400,
	mapPreviewZoom: 1.25,
};

export const CODE_EDITOR_LIMITS = {
	leftPanelWidth: { min: 120, max: 700 },
	rightPanelWidth: { min: 180, max: 700 },
	mapPreviewHeight: { min: 80, max: 700 },
	mapPreviewZoom: { min: 0.25, max: 5 },
} as const;

function clamp(value: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, value));
}

interface CodeEditorLayoutStore {
	leftPanelWidth: number;
	rightPanelWidth: number;
	mapPreviewHeight: number;
	mapPreviewZoom: number;
	resizeLeftPanel: (delta: number) => void;
	resizeRightPanel: (delta: number) => void;
	resizeMapPreview: (delta: number) => void;
	setMapPreviewZoom: (zoom: number) => void;
	resetCodeEditorLayout: () => void;
}

export const useCodeEditorLayoutStore = create<CodeEditorLayoutStore>((set) => ({
	leftPanelWidth: DEFAULTS.leftPanelWidth,
	rightPanelWidth: DEFAULTS.rightPanelWidth,
	mapPreviewHeight: DEFAULTS.mapPreviewHeight,
	mapPreviewZoom: DEFAULTS.mapPreviewZoom,

	resizeLeftPanel: (delta) =>
		set((state) => ({
			leftPanelWidth: clamp(
				state.leftPanelWidth + delta,
				CODE_EDITOR_LIMITS.leftPanelWidth.min,
				CODE_EDITOR_LIMITS.leftPanelWidth.max
			),
		})),

	resizeRightPanel: (delta) =>
		set((state) => ({
			rightPanelWidth: clamp(
				state.rightPanelWidth - delta,
				CODE_EDITOR_LIMITS.rightPanelWidth.min,
				CODE_EDITOR_LIMITS.rightPanelWidth.max
			),
		})),

	resizeMapPreview: (delta) =>
		set((state) => ({
			mapPreviewHeight: clamp(
				state.mapPreviewHeight + delta,
				CODE_EDITOR_LIMITS.mapPreviewHeight.min,
				CODE_EDITOR_LIMITS.mapPreviewHeight.max
			),
		})),

	setMapPreviewZoom: (zoom) =>
		set({
			mapPreviewZoom: clamp(
				zoom,
				CODE_EDITOR_LIMITS.mapPreviewZoom.min,
				CODE_EDITOR_LIMITS.mapPreviewZoom.max
			),
		}),

	resetCodeEditorLayout: () =>
		set({
			leftPanelWidth: DEFAULTS.leftPanelWidth,
			rightPanelWidth: DEFAULTS.rightPanelWidth,
			mapPreviewHeight: DEFAULTS.mapPreviewHeight,
			mapPreviewZoom: DEFAULTS.mapPreviewZoom,
		}),
}));
