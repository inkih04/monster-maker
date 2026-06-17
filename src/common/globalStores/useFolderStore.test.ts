import { describe, it, expect, beforeEach } from 'vitest';
import { useFolderStore } from './useFolderStore';
import type FolderNode from '../../../global/types/folderNode';

const mockFolder: FolderNode = {
	name: 'test-folder',
	path: '/mock/path',
	children: [],
};

describe('useFolderStore', () => {
	beforeEach(() => {
		useFolderStore.getState().reset();
		useFolderStore.setState({
			creatingFolderUnder: null,
			deletingFolder: null,
		});
	});

	it('should have correct default state', () => {
		const state = useFolderStore.getState();
		expect(state.selectedFolder).toBe(null);
		expect(state.creatingFolderUnder).toBe(null);
		expect(state.deletingFolder).toBe(null);
	});

	it('should set selected folder', () => {
		useFolderStore.getState().setSelectedFolder(mockFolder);
		expect(useFolderStore.getState().selectedFolder).toEqual(mockFolder);
	});

	it('should set creatingFolderUnder', () => {
		useFolderStore.getState().setCreatingFolderUnder(mockFolder);
		expect(useFolderStore.getState().creatingFolderUnder).toEqual(mockFolder);
	});

	it('should set deletingFolder', () => {
		useFolderStore.getState().setDeletingFolder(mockFolder);
		expect(useFolderStore.getState().deletingFolder).toEqual(mockFolder);
	});

	it('should reset selectedFolder state', () => {
		const store = useFolderStore.getState();
		store.setSelectedFolder(mockFolder);

		store.reset();

		expect(useFolderStore.getState().selectedFolder).toBe(null);
	});

	it('should allow clearing folders by setting null', () => {
		const store = useFolderStore.getState();
		store.setSelectedFolder(mockFolder);
		store.setSelectedFolder(null);
		expect(store.selectedFolder).toBe(null);
	});
});
