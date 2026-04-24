import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useLayoutResize, LIMITS } from './useLayoutResize';

describe('useLayoutResize', () => {
	it('should have correct default state', () => {
		const { result } = renderHook(() => useLayoutResize());

		expect(result.current.mapUtilityWidth).toBe(440);
		expect(result.current.entityWidth).toBe(490);
		expect(result.current.filesHeight).toBe(220);
		expect(result.current.filesMenuWidth).toBe(200);
		expect(result.current.tilesetHeight).toBe(330);
	});

	it('should resize map utility within limits', () => {
		const { result } = renderHook(() => useLayoutResize());

		act(() => {
			result.current.resizeMapUtility(60);
		});
		expect(result.current.mapUtilityWidth).toBe(500);

		act(() => {
			result.current.resizeMapUtility(5000);
		});
		expect(result.current.mapUtilityWidth).toBe(LIMITS.mapUtilityWidth.max);

		act(() => {
			result.current.resizeMapUtility(-5000);
		});
		expect(result.current.mapUtilityWidth).toBe(LIMITS.mapUtilityWidth.min);
	});

	it('should resize entity within limits', () => {
		const { result } = renderHook(() => useLayoutResize());

		act(() => {
			result.current.resizeEntity(90);
		});
		expect(result.current.entityWidth).toBe(400);

		act(() => {
			result.current.resizeEntity(-5000);
		});
		expect(result.current.entityWidth).toBe(LIMITS.entityWidth.max);

		act(() => {
			result.current.resizeEntity(5000);
		});
		expect(result.current.entityWidth).toBe(LIMITS.entityWidth.min);
	});

	it('should resize files within limits', () => {
		const { result } = renderHook(() => useLayoutResize());

		act(() => {
			result.current.resizeFiles(20);
		});
		expect(result.current.filesHeight).toBe(200);

		act(() => {
			result.current.resizeFiles(-5000);
		});
		expect(result.current.filesHeight).toBe(LIMITS.filesHeight.max);

		act(() => {
			result.current.resizeFiles(5000);
		});
		expect(result.current.filesHeight).toBe(LIMITS.filesHeight.min);
	});

	it('should resize files menu within limits', () => {
		const { result } = renderHook(() => useLayoutResize());

		act(() => {
			result.current.resizeFilesMenu(50);
		});
		expect(result.current.filesMenuWidth).toBe(250);

		act(() => {
			result.current.resizeFilesMenu(5000);
		});
		expect(result.current.filesMenuWidth).toBe(LIMITS.filesMenuWidth.max);

		act(() => {
			result.current.resizeFilesMenu(-5000);
		});
		expect(result.current.filesMenuWidth).toBe(LIMITS.filesMenuWidth.min);
	});

	it('should resize tileset within limits', () => {
		const { result } = renderHook(() => useLayoutResize());

		act(() => {
			result.current.resizeTileset(70);
		});
		expect(result.current.tilesetHeight).toBe(400);

		act(() => {
			result.current.resizeTileset(5000);
		});
		expect(result.current.tilesetHeight).toBe(LIMITS.tilesetHeight.max);

		act(() => {
			result.current.resizeTileset(-5000);
		});
		expect(result.current.tilesetHeight).toBe(LIMITS.tilesetHeight.min);
	});

	it('should reset layout to defaults', () => {
		const { result } = renderHook(() => useLayoutResize());

		act(() => {
			result.current.resizeMapUtility(100);
			result.current.resizeEntity(-100);
			result.current.resizeFiles(100);
			result.current.resizeFilesMenu(100);
			result.current.resizeTileset(-100);
		});

		act(() => {
			result.current.resetLayout();
		});

		expect(result.current.mapUtilityWidth).toBe(440);
		expect(result.current.entityWidth).toBe(490);
		expect(result.current.filesHeight).toBe(220);
		expect(result.current.filesMenuWidth).toBe(200);
		expect(result.current.tilesetHeight).toBe(330);
	});
});