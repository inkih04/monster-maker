import { useState, useCallback } from 'react';
import { useFolderPicker } from './useFolderPicker';
import { ProjectData } from '../../../global/types/projectData';

interface UseProjectFormOptions {
	onSuccess?: () => void;
}

export const useProjectForm = (options: UseProjectFormOptions = {}) => {
	const [name, setName] = useState('');
	const [tileSize, setTileSize] = useState(32);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const { path, setPath, selectFolder, isSelecting, reset: resetPath } = useFolderPicker();

	const isValid = useCallback(() => {
		return name.trim().length > 0 && path.length > 0;
	}, [name, path]);

	const reset = useCallback(() => {
		setName('');
		resetPath();
		setTileSize(32);
		setIsSubmitting(false);
	}, [resetPath]);

	const submit = useCallback(
		async (addProjectFn: (data: ProjectData) => Promise<{ success: boolean; error?: string }>) => {
			if (!isValid()) return { success: false };

			setIsSubmitting(true);

			const color = '#000000';

			const result = await addProjectFn({
				path,
				name: name.trim(),
				color,
				defaultTilesize: tileSize,
			});

			setIsSubmitting(false);

			if (result.success) {
				reset();
				options.onSuccess?.();
			}

			return result;
		},
		[name, path, isValid, reset, options]
	);

	return {
		name,
		setName,
		tileSize,
		setTileSize,
		path,
		setPath,
		selectFolder,
		submit,
		reset,
		isValid: isValid(),
		isSubmitting,
		isSelecting,
		isDisabled: !isValid() || isSubmitting || isSelecting,
	};
};
