import { useCallback, useState } from 'react';

const DEFAULTS = {
	mapUtilityWidth: 340 as number,
	entityWidth: 490 as number,
	filesHeight: 220 as number,
	filesMenuWidth: 200 as number,
};

export const LIMITS = {
	mapUtilityWidth: { min: 120, max: 400 },
	entityWidth: { min: 440, max: 700 },
	filesHeight: { min: 100, max: 500 },
	filesMenuWidth: { min: 100, max: 400 },
} as const;

function clamp(value: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, value));
}

export interface LayoutSizes {
	mapUtilityWidth: number;
	entityWidth: number;
	filesHeight: number;
	filesMenuWidth: number;
}

export interface LayoutResizeHandlers {
	resizeMapUtility: (delta: number) => void;
	resizeEntity: (delta: number) => void;
	resizeFiles: (delta: number) => void;
	resizeFilesMenu: (delta: number) => void;
	resetLayout: () => void;
}

export function useLayoutResize(): LayoutSizes & LayoutResizeHandlers {
	const [mapUtilityWidth, setMapUtilityWidth] = useState(DEFAULTS.mapUtilityWidth);
	const [entityWidth, setEntityWidth] = useState(DEFAULTS.entityWidth);
	const [filesHeight, setFilesHeight] = useState(DEFAULTS.filesHeight);
	const [filesMenuWidth, setFilesMenuWidth] = useState(DEFAULTS.filesMenuWidth);

	const resizeMapUtility = useCallback((delta: number) => {
		setMapUtilityWidth((prev) =>
			clamp(prev + delta, LIMITS.mapUtilityWidth.min, LIMITS.mapUtilityWidth.max)
		);
	}, []);

	const resizeEntity = useCallback((delta: number) => {
		setEntityWidth((prev) => clamp(prev - delta, LIMITS.entityWidth.min, LIMITS.entityWidth.max));
	}, []);

	const resizeFiles = useCallback((delta: number) => {
		setFilesHeight((prev) => clamp(prev - delta, LIMITS.filesHeight.min, LIMITS.filesHeight.max));
	}, []);

	const resizeFilesMenu = useCallback((delta: number) => {
		setFilesMenuWidth((prev) =>
			clamp(prev + delta, LIMITS.filesMenuWidth.min, LIMITS.filesMenuWidth.max)
		);
	}, []);

	const resetLayout = useCallback(() => {
		setMapUtilityWidth(DEFAULTS.mapUtilityWidth);
		setEntityWidth(DEFAULTS.entityWidth);
		setFilesHeight(DEFAULTS.filesHeight);
		setFilesMenuWidth(DEFAULTS.filesMenuWidth);
	}, []);

	return {
		mapUtilityWidth,
		entityWidth,
		filesHeight,
		filesMenuWidth,
		resizeMapUtility,
		resizeEntity,
		resizeFiles,
		resizeFilesMenu,
		resetLayout,
	};
}
