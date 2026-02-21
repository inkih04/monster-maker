import { useCallback, useEffect, useRef, useState } from 'react';

type Direction = 'horizontal' | 'vertical';

interface UseResizeOptions {
	direction: Direction;
	onResize: (delta: number) => void;
	minDelta?: number;
	maxDelta?: number;
}

interface UseResizeReturn {
	ref: React.RefObject<HTMLDivElement>;
	isDragging: boolean;
}

export function useResize({
	direction,
	onResize,
	minDelta = -Infinity,
	maxDelta = Infinity,
}: UseResizeOptions): UseResizeReturn {
	const ref = useRef<HTMLDivElement>(null);
	const [isDragging, setIsDragging] = useState(false);
	const originRef = useRef<number>(0);

	const handleMouseDown = useCallback(
		(e: MouseEvent) => {
			e.preventDefault();
			originRef.current = direction === 'vertical' ? e.clientX : e.clientY;
			setIsDragging(true);
		},
		[direction]
	);

	const handleMouseMove = useCallback(
		(e: MouseEvent) => {
			if (!isDragging) return;

			const current = direction === 'vertical' ? e.clientX : e.clientY;
			const rawDelta = current - originRef.current;
			const clampedDelta = Math.min(maxDelta, Math.max(minDelta, rawDelta));

			onResize(clampedDelta);
			originRef.current = current;
		},
		[isDragging, direction, onResize, minDelta, maxDelta]
	);

	const handleMouseUp = useCallback(() => {
		setIsDragging(false);
	}, []);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;

		el.addEventListener('mousedown', handleMouseDown);
		return () => el.removeEventListener('mousedown', handleMouseDown);
	}, [handleMouseDown]);

	useEffect(() => {
		if (!isDragging) return;

		window.addEventListener('mousemove', handleMouseMove);
		window.addEventListener('mouseup', handleMouseUp);

		return () => {
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('mouseup', handleMouseUp);
		};
	}, [isDragging, handleMouseMove, handleMouseUp]);

	return { ref, isDragging };
}
