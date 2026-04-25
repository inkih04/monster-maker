/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Map from './Map';
import { useMapStore } from './MapGState';
import { useTileSetStore } from '../Tileset/TileSetGState';
import { useProjectStore } from '../Project/ProjectConfigGState';
import { useToolsStore } from '../ToolBar/ToolBarGState';
import { useActiveTool } from '../ToolBar/customHooks/useActiveTool';
import { useGridCanvas } from '../common/customHooks/useGridCanvas';
import { useCanvasMouse } from './customHooks/useCanvasMouse';
import { useMapCapture } from './customHooks/useMapCapture';

vi.mock('./MapGState', () => {
	const useMapStoreMock = vi.fn();
	(useMapStoreMock as any).getState = vi.fn();
	return { useMapStore: useMapStoreMock };
});

vi.mock('../Tileset/TileSetGState', () => {
	const useTileSetStoreMock = vi.fn();
	(useTileSetStoreMock as any).getState = vi.fn();
	return { useTileSetStore: useTileSetStoreMock };
});

vi.mock('../Project/ProjectConfigGState', () => ({
	useProjectStore: vi.fn(),
}));

vi.mock('../ToolBar/ToolBarGState', () => ({
	useToolsStore: vi.fn(),
}));

vi.mock('../ToolBar/customHooks/useActiveTool', () => ({
	useActiveTool: vi.fn(),
}));

vi.mock('../common/customHooks/useGridCanvas', () => ({
	useGridCanvas: vi.fn(),
}));

vi.mock('../common/customHooks/useTileSetImages', () => ({
	useTileSetImages: vi.fn(),
}));

vi.mock('./customHooks/useCanvasMouse', () => ({
	useCanvasMouse: vi.fn(),
}));

vi.mock('./customHooks/useMapCapture', () => ({
	useMapCapture: vi.fn(),
}));

vi.mock('./MapLoadingOverlay', () => ({
	MapLoadingOverlay: () => <div data-testid="map-loading-overlay" />,
}));

vi.mock('./mapUtils', () => ({
	drawBrushPreview: vi.fn(),
	drawCollisionDebug: vi.fn(),
	drawEraserPreview: vi.fn(),
	drawSelectionOverlay: vi.fn(),
	drawSelectionPreview: vi.fn(),
	drawAreaCopyPreview: vi.fn(),
}));

describe('Map', () => {
	const mockSetZoom = vi.fn();
	const mockSetActiveLayer = vi.fn();
	const mockCreateMap = vi.fn();
	const mockClearSelection = vi.fn();
	const mockToggleShowCollisions = vi.fn();
	const mockSetSelectedArea = vi.fn();

	let toggleCollisionsCallback: () => void;

	beforeEach(() => {
		vi.clearAllMocks();

		(window as any).api = {
			onToggleCollisions: vi.fn((cb) => {
				toggleCollisionsCallback = cb;
				return vi.fn();
			}),
		};

		(useMapStore as any).mockImplementation((selector: any) =>
			selector({
				zoom: 1,
				setZoom: mockSetZoom,
				paintedTiles: [],
				setActiveLayer: mockSetActiveLayer,
				activeLayer: 'ground',
				tileSize: 16,
				createMap: mockCreateMap,
				selectedTilePositions: [],
				toggleShowCollisions: mockToggleShowCollisions,
				clearSelection: mockClearSelection,
				showCollisions: false,
				isDirty: false,
				visibleLayers: { ground: true, decoration: true, entities: true, shadows: true, foreground: true },
				lockedLayers: { ground: false, decoration: false, entities: false, shadows: false, foreground: false },
				map: { tileSize: 16 },
			})
		);

		(useMapStore as any).getState.mockReturnValue({
			map: { entities: {} },
		});

		(useTileSetStore as any).mockImplementation((selector: any) =>
			selector({
				tilesets: {},
				currentTileSetPath: null,
				selectedArea: null,
			})
		);

		(useTileSetStore as any).getState.mockReturnValue({
			setSelectedArea: mockSetSelectedArea,
		});

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

		(useActiveTool as any).mockReturnValue({
			isActive: false,
			previewPosition: null,
			setIsActive: vi.fn(),
			setPreviewPosition: vi.fn(),
			onTileClick: vi.fn(),
			onTileDrag: vi.fn(),
		});

		(useGridCanvas as any).mockReturnValue({
			canvasRef: { current: null },
			containerRef: { current: null },
		});

		(useMapCapture as any).mockReturnValue({
			isCapturingRef: { current: false },
		});

		(useCanvasMouse as any).mockReturnValue({
			handleMouseDown: vi.fn(),
			handleMouseMove: vi.fn(),
			handleMouseUp: vi.fn(),
			handleMouseLeave: vi.fn(),
		});
	});

	it('should render map controls and overlay', () => {
		render(<Map />);
		expect(screen.getByText('Ground')).toBeInTheDocument();
		expect(screen.getByText('Decoration')).toBeInTheDocument();
		expect(screen.getByText('Entities')).toBeInTheDocument();
		expect(screen.getByText('Shadows')).toBeInTheDocument();
		expect(screen.getByText('Foreground')).toBeInTheDocument();
		expect(screen.getByText('100%')).toBeInTheDocument();
		expect(screen.getByTestId('map-loading-overlay')).toBeInTheDocument();
	});

	it('should call setZoom when zoom buttons are clicked', () => {
		render(<Map />);
		const zoomInBtn = screen.getByText('+');
		const zoomOutBtn = screen.getByText('-');

		fireEvent.click(zoomInBtn);
		expect(mockSetZoom).toHaveBeenCalledWith(1.25);

		fireEvent.click(zoomOutBtn);
		expect(mockSetZoom).toHaveBeenCalledWith(0.75);
	});

	it('should call setActiveLayer when layer buttons are clicked', () => {
		render(<Map />);
		fireEvent.click(screen.getByText('Decoration'));
		expect(mockSetActiveLayer).toHaveBeenCalledWith('decoration');

		fireEvent.click(screen.getByText('Entities'));
		expect(mockSetActiveLayer).toHaveBeenCalledWith('entities');
	});

	it('should call clearSelection and setSelectedArea on Escape key press', () => {
		render(<Map />);
		fireEvent.keyDown(window, { key: 'Escape' });
		
		expect(mockClearSelection).toHaveBeenCalled();
		expect(mockSetSelectedArea).toHaveBeenCalledWith(null);
	});

	it('should call createMap when currentProject is present on mount', () => {
		render(<Map />);
		expect(mockCreateMap).toHaveBeenCalledWith(expect.any(String), 100, 100, 16);
	});

	it('should toggle collisions when window.api event is triggered', () => {
		render(<Map />);
		toggleCollisionsCallback();
		expect(mockToggleShowCollisions).toHaveBeenCalled();
	});

	it('should show dirty overlay if isDirty is true', () => {
		(useMapStore as any).mockImplementation((selector: any) =>
			selector({
				zoom: 1,
				setZoom: mockSetZoom,
				paintedTiles: [],
				setActiveLayer: mockSetActiveLayer,
				activeLayer: 'ground',
				tileSize: 16,
				createMap: mockCreateMap,
				selectedTilePositions: [],
				toggleShowCollisions: mockToggleShowCollisions,
				clearSelection: mockClearSelection,
				showCollisions: false,
				isDirty: true,
				visibleLayers: { ground: true },
				lockedLayers: { ground: false },
				map: { tileSize: 16 },
			})
		);

		const { container } = render(<Map />);
		const overlay = container.querySelector('.tilemap-dirty-overlay--visible');
		expect(overlay).toBeInTheDocument();
	});
});