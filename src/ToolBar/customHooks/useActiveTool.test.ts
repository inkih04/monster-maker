/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useActiveTool } from './useActiveTool';
import { useToolsStore } from '../ToolBarGState';

const mockBrushTool = { name: 'brushTool' };
const mockEraserTool = { name: 'eraserTool' };
const mockSelectTool = { name: 'selectTool' };
const mockAreaCopyTool = { name: 'areaCopyTool' };

vi.mock('./useBrushTool', () => ({ useBrushTool: () => mockBrushTool }));
vi.mock('./useEraserTool', () => ({ useEraserTool: () => mockEraserTool }));
vi.mock('./useSelectTool', () => ({ useSelectTool: () => mockSelectTool }));
vi.mock('./useAreaCopyTool', () => ({ useAreaCopyTool: () => mockAreaCopyTool }));

vi.mock('../ToolBarGState', () => ({
	useToolsStore: vi.fn(),
}));

describe('useActiveTool', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	const setMockActiveTool = (toolName: string) => {
		(useToolsStore as any).mockImplementation((selector: any) =>
			selector({ activeTool: toolName })
		);
	};

	it('should return brush tool when activeTool is "brush"', () => {
		setMockActiveTool('brush');
		const { result } = renderHook(() => useActiveTool());
		expect(result.current).toBe(mockBrushTool);
	});

	it('should return eraser tool when activeTool is "eraser"', () => {
		setMockActiveTool('eraser');
		const { result } = renderHook(() => useActiveTool());
		expect(result.current).toBe(mockEraserTool);
	});

	it('should return select tool when activeTool is "select"', () => {
		setMockActiveTool('select');
		const { result } = renderHook(() => useActiveTool());
		expect(result.current).toBe(mockSelectTool);
	});

	it('should return area-copy tool when activeTool is "area-copy"', () => {
		setMockActiveTool('area-copy');
		const { result } = renderHook(() => useActiveTool());
		expect(result.current).toBe(mockAreaCopyTool);
	});

	it('should return dummy no-op tool when activeTool is "entity"', () => {
		setMockActiveTool('entity');
		const { result } = renderHook(() => useActiveTool());
		
		expect(result.current.isActive).toBe(false);
		expect(result.current.previewPosition).toBeNull();
		
		expect(() => result.current.setIsActive(true)).not.toThrow();
		expect(() => result.current.setPreviewPosition({ x: 0, y: 0 })).not.toThrow();
		expect(() => result.current.onTileClick(0, 0)).not.toThrow();
		expect(() => result.current.onTileDrag(0, 0)).not.toThrow();
	});

	it('should return brush tool as default for unknown activeTool', () => {
		setMockActiveTool('unknown-tool-name');
		const { result } = renderHook(() => useActiveTool());
		expect(result.current).toBe(mockBrushTool);
	});
});