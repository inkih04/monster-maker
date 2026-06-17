/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useFileToBeCreatedStore } from './useFileToBeCreated';

const mockSaveFile = vi.fn();
const mockPathUnion = vi.fn();

(window as any).api = {
	saveFileCompletePath: mockSaveFile,
	pathUnion: mockPathUnion,
};

describe('useFileToBeCreatedStore', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		useFileToBeCreatedStore.getState().reset();
	});

	it('should have correct default state', () => {
		const state = useFileToBeCreatedStore.getState();
		expect(state.isOpen).toBe(false);
		expect(state.extension).toBe(null);
		expect(state.content).toBe(null);
		expect(state.lastFilePath).toBe(null);
	});

	it('should update content', () => {
		useFileToBeCreatedStore.getState().setContent('test content');
		expect(useFileToBeCreatedStore.getState().content).toBe('test content');
	});

	it('should reset state', () => {
		const store = useFileToBeCreatedStore.getState();
		store.setExtension('.ts');
		store.setContent('data');
		store.setOpen(true);
		
		store.reset();
		
		const state = useFileToBeCreatedStore.getState();
		expect(state.extension).toBe(null);
		expect(state.content).toBe(null);
	});

	describe('createFile execution', () => {
		it('should call saveFileCompletePath for standard files', async () => {
			mockSaveFile.mockResolvedValue({ success: true });
			
			const store = useFileToBeCreatedStore.getState();
			store.setExtension('.txt');
			store.setContent('Hello World');
			
			const result = await store.createFile('test', '/mock/path');

			expect(mockSaveFile).toHaveBeenCalledWith('test.txt', '/mock/path', 'Hello World');
			expect(result.success).toBe(true);
			expect(useFileToBeCreatedStore.getState().extension).toBe(null);
		});

		it('should handle .ui file logic and asset creation', async () => {
			mockSaveFile.mockResolvedValue({ success: true });
			mockPathUnion.mockResolvedValue('/mock/path/.MyUI');

			const store = useFileToBeCreatedStore.getState();
			store.setExtension('.ui');
			store.setContent('ID: __UI_NAME__');

			const result = await store.createFile('MyUI', '/mock/path');

			expect(mockSaveFile).toHaveBeenNthCalledWith(1, 'MyUI.ui', '/mock/path', 'ID: MyUI');
			expect(mockPathUnion).toHaveBeenCalledWith('/mock/path', '.MyUI');
			expect(mockSaveFile).toHaveBeenCalledTimes(3);
			expect(result.success).toBe(true);
		});

		it('should not reset store if api call fails', async () => {
			mockSaveFile.mockResolvedValue({ success: false, error: 'Write error' });
			
			const store = useFileToBeCreatedStore.getState();
			store.setExtension('.json');
			
			const result = await store.createFile('data', '/path');

			expect(result.success).toBe(false);
			expect(useFileToBeCreatedStore.getState().extension).toBe('.json');
		});
	});
});