import React, { useState } from 'react';
import { useFolderStore } from '../../../../common/globalStores/useFolderStore';

type DragFieldId = 'initialMapPath' | 'imageIconPath' | 'defaultFont';

const ALLOWED_TYPES: Record<DragFieldId, string> = {
	initialMapPath: 'tilemap',
	imageIconPath: 'tileset',
	defaultFont: 'font',
};

type DragState = {
	fieldId: DragFieldId;
	valid: boolean;
} | null;

export function useGameConfigDrag() {
	const selectedFolder = useFolderStore((state) => state.selectedFolder);
	const [dragState, setDragState] = useState<DragState>(null);

	const handleDragOver = (e: React.DragEvent, fieldId: DragFieldId) => {
		e.preventDefault();
		e.stopPropagation();

		const allowedType = ALLOWED_TYPES[fieldId];
		const valid = e.dataTransfer.types.includes(`file-type/${allowedType}`);

		if (!e.dataTransfer.types.some((t) => t.startsWith('file-type/'))) return;

		e.dataTransfer.dropEffect = valid ? 'copy' : 'none';
		setDragState({ fieldId, valid });
	};

	const handleDragLeave = () => setDragState(null);

	const handleDrop = async (
		e: React.DragEvent,
		fieldId: DragFieldId,
		onSuccess: (value: string) => void
	) => {
		e.preventDefault();
		e.stopPropagation();
		setDragState(null);

		const allowedType = ALLOWED_TYPES[fieldId];
		const isValid = e.dataTransfer.types.includes(`file-type/${allowedType}`);
		if (!isValid) return;

		const fileData = e.dataTransfer.getData('application/file-item');
		if (!fileData || !selectedFolder?.path) return;

		const file = JSON.parse(fileData);
		const finalPath = await window.api.pathUnion(selectedFolder.path, file.path);
		onSuccess(finalPath);
	};

	const getDragClass = (fieldId: DragFieldId): string => {
		if (!dragState || dragState.fieldId !== fieldId) return '';
		return dragState.valid ? 'game-config--drag-valid' : 'game-config--drag-invalid';
	};

	return {
		handleDragOver,
		handleDragLeave,
		handleDrop,
		getDragClass,
	};
}
