import { create } from 'zustand';
import { ToolType } from '../../global/types/toolType';

interface ToolsStore {
	activeTool: ToolType;
	setActiveTool: (tool: ToolType) => void;
}

export const useToolsStore = create<ToolsStore>((set) => ({
	activeTool: 'brush',

	setActiveTool: (tool) => {
		set({ activeTool: tool });
	},
}));
