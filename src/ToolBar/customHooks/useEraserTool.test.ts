/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useEraserTool } from './useEraserTool';
import { useMapStore } from '../../Map/MapGState';

vi.mock('../../Map/MapGState', () => ({
	useMapStore: vi.fn(),
}));

describe('useEraserTool', () => {
	const mockRemoveEntity = vi.fn();
	const mockSetIsDirty = vi.fn();

	const setupMocks = (mapStateOverrides = {}) => {
		(useMapStore as any).mockImplementation((selector: any) =>
			selector({
				activeLayer: 'ground',
				paintedTiles: [],
				removeEntity: mockRemoveEntity,
				setIsDirty: mockSetIsDirty,
				...mapStateOverrides,
			})
		);
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should return initial state correctly', () => {
		setupMocks();
		const { result } = renderHook(() => useEraserTool());

		expect(result.current.isActive).toBe(false);
		expect(result.current.previewPosition).toBeNull();
	});

	it('should update isActive and previewPosition', () => {
		setupMocks();
		const { result } = renderHook(() => useEraserTool());

		act(() => {
			result.current.setIsActive(true);
			result.current.setPreviewPosition({ x: 5, y: 5 });
		});

		expect(result.current.isActive).toBe(true);
		expect(result.current.previewPosition).toEqual({ x: 5, y: 5 });
	});

	it('should do nothing if no tile exists at the clicked location and layer', () => {
		setupMocks({
			paintedTiles: [{ x: 1, y: 1, layer: 'ground', entityId: 'ent1' }]
		});
		const { result } = renderHook(() => useEraserTool());

		act(() => {
			result.current.onTileClick(5, 5);
		});

		expect(mockRemoveEntity).not.toHaveBeenCalled();
		expect(mockSetIsDirty).not.toHaveBeenCalled();
	});

	it('should remove entity and set isDirty if tile exists at the clicked location and active layer', () => {
		setupMocks({
			activeLayer: 'decoration',
			paintedTiles: [
				{ x: 5, y: 5, layer: 'ground', entityId: 'ent_ground' },
				{ x: 5, y: 5, layer: 'decoration', entityId: 'ent_dec1' },
				{ x: 5, y: 5, layer: 'decoration', entityId: 'ent_dec2' },
			]
		});
		const { result } = renderHook(() => useEraserTool());

		act(() => {
			result.current.onTileClick(5, 5);
		});

		expect(mockRemoveEntity).toHaveBeenCalledTimes(2);
		expect(mockRemoveEntity).toHaveBeenCalledWith('ent_dec1');
		expect(mockRemoveEntity).toHaveBeenCalledWith('ent_dec2');
		expect(mockSetIsDirty).toHaveBeenCalledWith(true);
	});

	it('should erase tile on drag as well', () => {
		setupMocks({
			activeLayer: 'ground',
			paintedTiles: [{ x: 10, y: 15, layer: 'ground', entityId: 'ent_drag' }]
		});
		const { result } = renderHook(() => useEraserTool());

		act(() => {
			result.current.onTileDrag(10, 15);
		});

		expect(mockRemoveEntity).toHaveBeenCalledTimes(1);
		expect(mockRemoveEntity).toHaveBeenCalledWith('ent_drag');
		expect(mockSetIsDirty).toHaveBeenCalledWith(true);
	});
});