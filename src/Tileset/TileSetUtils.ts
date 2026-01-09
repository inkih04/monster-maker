import { TileSelection } from './TileSetGState';

export interface SelectionInfo {
	minX: number;
	minY: number;
	width: number;
	height: number;
}

export function getSelectionInfo(selectedArea: TileSelection | null): SelectionInfo | null {
	if (!selectedArea) return null;

	const minX = Math.min(selectedArea.startX, selectedArea.endX);
	const maxX = Math.max(selectedArea.startX, selectedArea.endX);
	const minY = Math.min(selectedArea.startY, selectedArea.endY);
	const maxY = Math.max(selectedArea.startY, selectedArea.endY);

	const width = maxX - minX + 1;
	const height = maxY - minY + 1;

	return { minX, minY, width, height };
}

export function getFileNameFromPath(path: string): string {
	return path.split('/').pop() || 'Nombre.png';
}
