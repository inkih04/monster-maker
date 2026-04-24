import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCanvasMouse } from './useCanvasMouse';

describe('useCanvasMouse', () => {
	const mockSetIsToolActive = vi.fn();
	const mockSetPreviewPosition = vi.fn();
	const mockOnTileClick = vi.fn();
	const mockOnTileDrag = vi.fn();

	const defaultProps = {
		zoom: 2,
		tileSize: 16,
		isToolActive: false,
		setIsToolActive: mockSetIsToolActive,
		setPreviewPosition: mockSetPreviewPosition,
		onTileClick: mockOnTileClick,
		onTileDrag: mockOnTileDrag,
	};

	const createMockMouseEvent = (
		clientX: number,
		clientY: number,
		modifiers = { ctrlKey: false, shiftKey: false, metaKey: false }
	) => {
		return {
			clientX,
			clientY,
			...modifiers,
			currentTarget: {
				getBoundingClientRect: () => ({
					left: 10,
					top: 20,
					width: 800,
					height: 600,
					right: 810,
					bottom: 620,
					x: 10,
					y: 20,
					toJSON: () => {},
				}),
			},
		} as unknown as React.MouseEvent<HTMLCanvasElement>;
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should handle mouse down and calculate correct coordinates', () => {
		const { result } = renderHook(() => useCanvasMouse(defaultProps));

		const event = createMockMouseEvent(74, 116, { ctrlKey: true, shiftKey: false, metaKey: false });

		act(() => {
			result.current.handleMouseDown(event);
		});

		expect(mockSetIsToolActive).toHaveBeenCalledWith(true);
		expect(mockOnTileClick).toHaveBeenCalledWith(2, 3, { ctrl: true, shift: false });
	});

	it('should handle metaKey as ctrl modifier on mouse down', () => {
		const { result } = renderHook(() => useCanvasMouse(defaultProps));

		const event = createMockMouseEvent(74, 116, { ctrlKey: false, shiftKey: true, metaKey: true });

		act(() => {
			result.current.handleMouseDown(event);
		});

		expect(mockOnTileClick).toHaveBeenCalledWith(2, 3, { ctrl: true, shift: true });
	});

	it('should handle mouse move when tool is not active', () => {
		const { result } = renderHook(() => useCanvasMouse(defaultProps));

		const event = createMockMouseEvent(106, 148);

		act(() => {
			result.current.handleMouseMove(event);
		});

		expect(mockSetPreviewPosition).toHaveBeenCalledWith({ x: 3, y: 4 });
		expect(mockOnTileDrag).not.toHaveBeenCalled();
	});

	it('should handle mouse move when tool is active', () => {
		const { result } = renderHook(() => useCanvasMouse({ ...defaultProps, isToolActive: true }));

		const event = createMockMouseEvent(106, 148, {
			ctrlKey: false,
			shiftKey: true,
			metaKey: false,
		});

		act(() => {
			result.current.handleMouseMove(event);
		});

		expect(mockSetPreviewPosition).toHaveBeenCalledWith({ x: 3, y: 4 });
		expect(mockOnTileDrag).toHaveBeenCalledWith(3, 4, { ctrl: false, shift: true });
	});

	it('should handle mouse up', () => {
		const { result } = renderHook(() => useCanvasMouse(defaultProps));

		act(() => {
			result.current.handleMouseUp();
		});

		expect(mockSetIsToolActive).toHaveBeenCalledWith(false);
	});

	it('should handle mouse leave', () => {
		const { result } = renderHook(() => useCanvasMouse(defaultProps));

		act(() => {
			result.current.handleMouseLeave();
		});

		expect(mockSetIsToolActive).toHaveBeenCalledWith(false);
		expect(mockSetPreviewPosition).toHaveBeenCalledWith(null);
	});
});
