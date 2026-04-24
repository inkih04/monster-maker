import { describe, it, expect, beforeEach } from 'vitest';
import { useFolderEventsStore } from './FolderEventsGState';

describe('useFolderEventsStore', () => {
	beforeEach(() => {
		useFolderEventsStore.setState({
			lastFolderAction: null,
			lastFolderMenuClosed: null,
		});
	});

	it('should have initial state', () => {
		const state = useFolderEventsStore.getState();
		expect(state.lastFolderAction).toBeNull();
		expect(state.lastFolderMenuClosed).toBeNull();
	});

	it('should dispatch folder action and update state', () => {
		useFolderEventsStore.getState().dispatchFolderAction('CREATE_FILE', '/mock/folder/path');

		const state = useFolderEventsStore.getState();
		expect(state.lastFolderAction).toEqual({
			action: 'CREATE_FILE',
			folderPath: '/mock/folder/path',
		});
	});

	it('should dispatch folder menu closed and update state', () => {
		useFolderEventsStore.getState().dispatchFolderMenuClosed('/mock/another/path');

		const state = useFolderEventsStore.getState();
		expect(state.lastFolderMenuClosed).toEqual({
			folderPath: '/mock/another/path',
		});
	});

	it('should overwrite previous folder action on new dispatch', () => {
		const store = useFolderEventsStore.getState();

		store.dispatchFolderAction('CREATE', '/path/1');
		expect(useFolderEventsStore.getState().lastFolderAction).toEqual({
			action: 'CREATE',
			folderPath: '/path/1',
		});

		store.dispatchFolderAction('DELETE', '/path/2');
		expect(useFolderEventsStore.getState().lastFolderAction).toEqual({
			action: 'DELETE',
			folderPath: '/path/2',
		});
	});
});
