import { useBrushTool } from './useBrushTool';
import { useEraserTool } from './useEraserTool';
import { useSelectTool } from './useSelectTool';
import { useToolsStore } from '../ToolBarGState';

interface PreviewPosition {
	x: number;
	y: number;
}

interface UseActiveToolResult {
	isActive: boolean;
	previewPosition: PreviewPosition | null;
	setIsActive: (value: boolean) => void;
	setPreviewPosition: (pos: PreviewPosition | null) => void;
	onTileClick: (
		tileX: number,
		tileY: number,
		modifiers?: { ctrl?: boolean; shift?: boolean }
	) => void;
	onTileDrag: (
		tileX: number,
		tileY: number,
		modifiers?: { ctrl?: boolean; shift?: boolean }
	) => void;
}

export function useActiveTool(): UseActiveToolResult {
	const activeTool = useToolsStore((state) => state.activeTool);

	const brushTool = useBrushTool();
	const eraserTool = useEraserTool();
	const selectTool = useSelectTool();

	switch (activeTool) {
		case 'brush':
			return brushTool;

		case 'eraser':
			return eraserTool;

		case 'select':
			return selectTool;

		case 'area-copy':
		case 'entity':
			return {
				isActive: false,
				previewPosition: null,
				setIsActive: () => {},
				setPreviewPosition: () => {},
				onTileClick: () => {},
				onTileDrag: () => {},
			};

		default:
			return brushTool;
	}
}
