import { useCodeEditorLayoutStore, CODE_EDITOR_LIMITS } from '../CodeEditorLayoutGState';

export { CODE_EDITOR_LIMITS };

export function useLayoutCodeEditorResize() {
	const leftPanelWidth = useCodeEditorLayoutStore((state) => state.leftPanelWidth);
	const rightPanelWidth = useCodeEditorLayoutStore((state) => state.rightPanelWidth);
	const mapPreviewHeight = useCodeEditorLayoutStore((state) => state.mapPreviewHeight);
	const mapPreviewZoom = useCodeEditorLayoutStore((state) => state.mapPreviewZoom);
	const resizeLeftPanel = useCodeEditorLayoutStore((state) => state.resizeLeftPanel);
	const resizeRightPanel = useCodeEditorLayoutStore((state) => state.resizeRightPanel);
	const resizeMapPreview = useCodeEditorLayoutStore((state) => state.resizeMapPreview);
	const setMapPreviewZoom = useCodeEditorLayoutStore((state) => state.setMapPreviewZoom);
	const resetCodeEditorLayout = useCodeEditorLayoutStore((state) => state.resetCodeEditorLayout);

	return {
		leftPanelWidth,
		rightPanelWidth,
		mapPreviewHeight,
		mapPreviewZoom,
		resizeLeftPanel,
		resizeRightPanel,
		resizeMapPreview,
		setMapPreviewZoom,
		resetCodeEditorLayout,
	};
}
