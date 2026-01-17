import { useState } from 'react';

export const useFolderPicker = (initialPath: string = '') => {
	const [path, setPath] = useState(initialPath);
	const [isSelecting, setIsSelecting] = useState(false);

	const selectFolder = async () => {
		if (!window.api?.selectFolder) return false;

		setIsSelecting(true);
		try {
			const result = await window.api.selectFolder();
			if (result.success && result.path) {
				setPath(result.path);
				return true;
			}
			return false;
		} catch (error) {
			console.error('Error selecting folder:', error);
			return false;
		} finally {
			setIsSelecting(false);
		}
	};

	const reset = () => setPath(initialPath);

	return {
		path,
		setPath,
		selectFolder,
		isSelecting,
		reset,
	};
};
