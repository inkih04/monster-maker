import { useBrushTool } from './useBrushTool';
import { useEraserTool } from './useEraserTool';
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
	onTileClick: (tileX: number, tileY: number) => void;
	onTileDrag: (tileX: number, tileY: number) => void;
}

export function useActiveTool(): UseActiveToolResult {
	const activeTool = useToolsStore((state) => state.activeTool);

	const brushTool = useBrushTool();
	const eraserTool = useEraserTool();

	switch (activeTool) {
		case 'brush':
			return brushTool;
		
		case 'eraser':
			return eraserTool;
		
		case 'select':
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