/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach } from 'vitest';
import { useToolsStore } from './ToolBarGState';

describe('useToolsStore', () => {
	beforeEach(() => {
		useToolsStore.setState({ activeTool: 'brush' });
	});

	it('should have correct initial state', () => {
		const state = useToolsStore.getState();
		expect(state.activeTool).toBe('brush');
	});

	it('should change active tool', () => {
		const store = useToolsStore.getState();

		store.setActiveTool('eraser' as any);
		expect(useToolsStore.getState().activeTool).toBe('eraser');

		store.setActiveTool('selection' as any);
		expect(useToolsStore.getState().activeTool).toBe('selection');
	});
});