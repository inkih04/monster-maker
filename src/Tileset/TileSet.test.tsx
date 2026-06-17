/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TileSet from './TileSet';
import { useTileSetStore } from './TileSetGState';
import { useProjectStore } from '../Project/ProjectConfigGState';
import { useToolsStore } from '../ToolBar/ToolBarGState';
import { useTileSetImages } from '../common/customHooks/useTileSetImages';
import { useGridCanvas } from '../common/customHooks/useGridCanvas';
import { useTileSelection } from '../common/customHooks/useTileSelection';
import { getSelectionInfo, getFileNameFromPath } from './TileSetUtils';

vi.mock('./TileSetGState', () => ({
	useTileSetStore: vi.fn(),
}));

vi.mock('../Project/ProjectConfigGState', () => ({
	useProjectStore: vi.fn(),
}));

vi.mock('../ToolBar/ToolBarGState', () => ({
	useToolsStore: vi.fn(),
}));

vi.mock('../common/customHooks/useTileSetImages', () => ({
	useTileSetImages: vi.fn(),
}));

vi.mock('../common/customHooks/useGridCanvas', () => ({
	useGridCanvas: vi.fn(),
}));

vi.mock('../common/customHooks/useTileSelection', () => ({
	useTileSelection: vi.fn(),
}));

vi.mock('./TileSetUtils', () => ({
	getSelectionInfo: vi.fn(),
	getFileNameFromPath: vi.fn(),
}));

vi.mock('../common/components/tileSize/TileSize', () => ({
	default: () => <div data-testid="tile-size" />,
}));

describe('TileSet', () => {
	const mockSetZoom = vi.fn();
	const mockSetSelectedArea = vi.fn();
	const mockHandleMouseDown = vi.fn();
	const mockHandleMouseMove = vi.fn();
	const mockHandleMouseUp = vi.fn();
	const mockHandleMouseLeave = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();

		(useTileSetStore as any).mockImplementation((selector: any) =>
			selector({
				zoom: 1,
				setZoom: mockSetZoom,
				selectedArea: null,
				setSelectedArea: mockSetSelectedArea,
				currentTileSetPath: null,
				tilesets: {},
			})
		);

		(useProjectStore as any).mockImplementation((selector: any) =>
			selector({
				currentProject: { defaultTilesize: 16 },
			})
		);

		(useToolsStore as any).mockImplementation((selector: any) =>
			selector({
				activeTool: 'brush',
			})
		);

		(useTileSetImages as any).mockReturnValue({});

		(useGridCanvas as any).mockReturnValue({
			canvasRef: { current: document.createElement('canvas') },
			containerRef: { current: document.createElement('div') },
		});

		(useTileSelection as any).mockReturnValue({
			handleMouseDown: mockHandleMouseDown,
			handleMouseMove: mockHandleMouseMove,
			handleMouseUp: mockHandleMouseUp,
			handleMouseLeave: mockHandleMouseLeave,
		});

		(getSelectionInfo as any).mockReturnValue(null);
		(getFileNameFromPath as any).mockReturnValue('');
	});

	it('should render the component with initial state', () => {
		render(<TileSet />);

		expect(screen.getByText('100%')).toBeInTheDocument();
		expect(screen.getByText('+')).toBeInTheDocument();
		expect(screen.getByText('-')).toBeInTheDocument();
		expect(screen.getByTestId('tile-size')).toBeInTheDocument();
	});

	it('should increase zoom when zoom in button is clicked', () => {
		render(<TileSet />);
		fireEvent.click(screen.getByText('+'));
		expect(mockSetZoom).toHaveBeenCalledWith(1.25);
	});

	it('should decrease zoom when zoom out button is clicked', () => {
		render(<TileSet />);
		fireEvent.click(screen.getByText('-'));
		expect(mockSetZoom).toHaveBeenCalledWith(0.75);
	});

	it('should render file name and selection info if available', () => {
		(getFileNameFromPath as any).mockReturnValue('level1_tiles.png');
		(getSelectionInfo as any).mockReturnValue({
			minX: 2,
			minY: 3,
			width: 4,
			height: 5,
		});

		render(<TileSet />);

		expect(screen.getByText('level1_tiles.png')).toBeInTheDocument();
		expect(screen.getByText('(2, 3) - 4×5 tiles')).toBeInTheDocument();
	});

	it('should clear selected area if brush is not active', () => {
		(useTileSetStore as any).mockImplementation((selector: any) =>
			selector({
				zoom: 1,
				setZoom: mockSetZoom,
				selectedArea: { startX: 0, startY: 0, endX: 1, endY: 1 },
				setSelectedArea: mockSetSelectedArea,
				currentTileSetPath: null,
				tilesets: {},
			})
		);

		(useToolsStore as any).mockImplementation((selector: any) =>
			selector({
				activeTool: 'eraser',
			})
		);

		render(<TileSet />);

		expect(mockSetSelectedArea).toHaveBeenCalledWith(null);
	});

	it('should attach and call mouse event handlers when brush is active', () => {
		render(<TileSet />);
		const canvas = document.querySelector('.tilemap-canvas');

		if (canvas) {
			fireEvent.mouseDown(canvas);
			expect(mockHandleMouseDown).toHaveBeenCalled();

			fireEvent.mouseMove(canvas);
			expect(mockHandleMouseMove).toHaveBeenCalled();

			fireEvent.mouseUp(canvas);
			expect(mockHandleMouseUp).toHaveBeenCalled();

			fireEvent.mouseLeave(canvas);
			expect(mockHandleMouseLeave).toHaveBeenCalled();
		}
	});

	it('should ignore mouse event handlers when brush is not active', () => {
		(useToolsStore as any).mockImplementation((selector: any) =>
			selector({
				activeTool: 'eraser',
			})
		);

		render(<TileSet />);
		const canvas = document.querySelector('.tilemap-canvas');

		if (canvas) {
			fireEvent.mouseDown(canvas);
			expect(mockHandleMouseDown).not.toHaveBeenCalled();

			fireEvent.mouseMove(canvas);
			expect(mockHandleMouseMove).not.toHaveBeenCalled();

			fireEvent.mouseUp(canvas);
			expect(mockHandleMouseUp).not.toHaveBeenCalled();

			fireEvent.mouseLeave(canvas);
			expect(mockHandleMouseLeave).not.toHaveBeenCalled();
		}
	});
});