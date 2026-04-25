/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ToolBar from './ToolBar';
import { useToolsStore } from './ToolBarGState';
import { useMapStore } from '../Map/MapGState';
import { useProjectStore } from '../Project/ProjectConfigGState';
import { useEngineStore } from './EngineGState';
import { useDialogueStore } from '../DialogEditor/DialogueGState';
import { useNotify } from '../common/components/toast/ToastContext';

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string, options?: any) => (options ? `${key}_${JSON.stringify(options)}` : key),
	}),
}));

vi.mock('iconoir-react', () => ({
	Cube: () => <span data-testid="icon-cube" />,
	Redo: () => <span data-testid="icon-redo" />,
	Undo: () => <span data-testid="icon-undo" />,
	EraseSolid: () => <span data-testid="icon-erase" />,
	EditPencil: () => <span data-testid="icon-brush" />,
	OneFingerSelectHandGesture: () => <span data-testid="icon-select" />,
	Play: () => <span data-testid="icon-play" />,
	DragHandGesture: () => <span data-testid="icon-area-copy" />,
	Square: () => <span data-testid="icon-square" />,
	Bug: () => <span data-testid="icon-bug" />,
	CodeBrackets: () => <span data-testid="icon-code-map" />,
	Codepen: () => <span data-testid="icon-code-pen" />,
	Pause: () => <span data-testid="icon-pause" />,
	ChatBubbleTranslate: () => <span data-testid="icon-translate" />,
}));

vi.mock('./ToolBarGState', () => ({
	useToolsStore: vi.fn(),
}));

vi.mock('../Map/MapGState', () => {
	const mockStore = vi.fn();
	(mockStore as any).temporal = {
		getState: vi.fn(),
	};
	return { useMapStore: mockStore };
});

vi.mock('../Project/ProjectConfigGState', () => ({
	useProjectStore: vi.fn(),
}));

vi.mock('./EngineGState', () => ({
	useEngineStore: vi.fn(),
}));

vi.mock('../DialogEditor/DialogueGState', () => {
	const mockStore = vi.fn();
	(mockStore as any).temporal = {
		getState: vi.fn(),
	};
	return { useDialogueStore: mockStore };
});

vi.mock('../common/components/toast/ToastContext', () => ({
	useNotify: vi.fn(),
}));

describe('ToolBar', () => {
	const mockSetActiveTool = vi.fn();
	const mockNotify = vi.fn();
	const mockMapUndo = vi.fn();
	const mockMapRedo = vi.fn();
	const mockDialogUndo = vi.fn();
	const mockDialogRedo = vi.fn();
	const mockChangeTranslate = vi.fn();
	const mockChangeEditorMode = vi.fn();
	const mockChangePaused = vi.fn();
	const mockSetEngineRunning = vi.fn();
	const mockResetEngineState = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();

		(window as any).api = {
			runEngine: vi.fn().mockResolvedValue({ success: true }),
			stopEngine: vi.fn().mockResolvedValue({ success: true }),
			sendEngineCommand: vi.fn().mockResolvedValue(true),
		};

		(useToolsStore as any).mockImplementation((selector: any) =>
			selector({
				activeTool: 'brush',
				setActiveTool: mockSetActiveTool,
			})
		);

		(useMapStore as any).mockImplementation((selector: any) =>
			selector({
				mapRelativePath: '/maps/level1.json',
				isDirty: false,
			})
		);
		(useMapStore as any).temporal.getState.mockReturnValue({
			undo: mockMapUndo,
			redo: mockMapRedo,
		});

		(useProjectStore as any).mockImplementation((selector: any) =>
			selector({
				currentProject: { id: 'test-project' },
			})
		);

		(useEngineStore as any).mockImplementation((selector: any) =>
			selector({
				translate: false,
				changeTranslate: mockChangeTranslate,
				editorMode: 'map',
				changeEditorMode: mockChangeEditorMode,
				paused: false,
				chagePaused: mockChangePaused,
				codeEditorMode: null,
				isRunning: false,
				runMode: null,
				setEngineRunning: mockSetEngineRunning,
				resetEngineState: mockResetEngineState,
			})
		);
		(useEngineStore as any).setState = vi.fn();

		(useDialogueStore as any).temporal.getState.mockReturnValue({
			undo: mockDialogUndo,
			redo: mockDialogRedo,
		});

		(useNotify as any).mockReturnValue({ notify: mockNotify });
	});

	it('should render standard tools correctly', () => {
		render(<ToolBar />);
		expect(screen.getByTestId('icon-cube')).toBeInTheDocument();
		expect(screen.getByTestId('icon-erase')).toBeInTheDocument();
		expect(screen.getByTestId('icon-brush')).toBeInTheDocument();
		expect(screen.getByTestId('icon-select')).toBeInTheDocument();
		expect(screen.getByTestId('icon-area-copy')).toBeInTheDocument();
		expect(screen.getByTestId('icon-play')).toBeInTheDocument();
		expect(screen.getByTestId('icon-bug')).toBeInTheDocument();
		expect(screen.getByTestId('icon-code-map')).toBeInTheDocument();
	});

	it('should call setActiveTool when a tool is clicked', () => {
		render(<ToolBar />);
		fireEvent.click(screen.getByTestId('icon-erase').parentElement!);
		expect(mockSetActiveTool).toHaveBeenCalledWith('eraser');
	});

	it('should call notify and setActiveTool when area-copy is clicked', () => {
		render(<ToolBar />);
		fireEvent.click(screen.getByTestId('icon-area-copy').parentElement!);
		expect(mockSetActiveTool).toHaveBeenCalledWith('area-copy');
		expect(mockNotify).toHaveBeenCalledWith(
			'areaCopy.title',
			'areaCopy.notifyBody',
			'success',
			5000
		);
	});

	it('should toggle editor mode', () => {
		render(<ToolBar />);
		fireEvent.click(screen.getByTestId('icon-code-map').parentElement!);
		expect(mockChangeEditorMode).toHaveBeenCalledWith('code');
	});

	it('should toggle translate mode', () => {
		render(<ToolBar />);
		fireEvent.click(screen.getByTestId('icon-translate').parentElement!);
		expect(mockChangeTranslate).toHaveBeenCalledWith(true);
	});

	it('should start engine in play mode', async () => {
		render(<ToolBar />);
		await act(async () => {
			fireEvent.click(screen.getByTestId('icon-play').parentElement!);
		});
		expect(mockSetEngineRunning).toHaveBeenCalledWith(true);
		expect((useEngineStore as any).setState).toHaveBeenCalledWith({ runMode: 'play' });
		expect((window as any).api.runEngine).toHaveBeenCalledWith({ id: 'test-project' });
		expect(mockNotify).toHaveBeenCalledWith(
			'engine.notifications.title',
			'engine.notifications.success_play',
			'success'
		);
	});

	it('should show dirty warning before starting engine if map is dirty', async () => {
		(useMapStore as any).mockImplementation((selector: any) =>
			selector({ mapRelativePath: '/maps/level1.json', isDirty: true })
		);
		render(<ToolBar />);
		await act(async () => {
			fireEvent.click(screen.getByTestId('icon-play').parentElement!);
		});
		expect(mockNotify).toHaveBeenCalledWith(
			'engine.notifications.warning_title',
			'engine.notifications.map_dirty',
			'error',
			2000
		);
	});

	it('should start engine in debug mode', async () => {
		render(<ToolBar />);
		await act(async () => {
			fireEvent.click(screen.getByTestId('icon-bug').parentElement!);
		});
		expect(mockSetEngineRunning).toHaveBeenCalledWith(true);
		expect((useEngineStore as any).setState).toHaveBeenCalledWith({ runMode: 'debug' });
		expect((window as any).api.runEngine).toHaveBeenCalledWith(
			{ id: 'test-project' },
			'/maps/level1.json'
		);
	});

	it('should render debug controls and allow pausing', async () => {
		(useEngineStore as any).mockImplementation((selector: any) =>
			selector({
				editorMode: 'map',
				isRunning: true,
				runMode: 'debug',
				paused: false,
				chagePaused: mockChangePaused,
			})
		);
		render(<ToolBar />);
		expect(screen.getByTestId('icon-pause')).toBeInTheDocument();
		expect(screen.getByTestId('icon-square')).toBeInTheDocument();

		await act(async () => {
			fireEvent.click(screen.getByTestId('icon-pause').parentElement!);
		});
		expect(mockChangePaused).toHaveBeenCalledWith(true);
		expect((window as any).api.sendEngineCommand).toHaveBeenCalledWith('PAUSE');
	});

	it('should call map undo and redo in map mode', () => {
		render(<ToolBar />);
		fireEvent.click(screen.getByTestId('icon-undo').parentElement!);
		expect(mockMapUndo).toHaveBeenCalled();

		fireEvent.click(screen.getByTestId('icon-redo').parentElement!);
		expect(mockMapRedo).toHaveBeenCalled();
	});

	it('should call dialogue undo and redo in dialog code mode', () => {
		(useEngineStore as any).mockImplementation((selector: any) =>
			selector({
				editorMode: 'code',
				codeEditorMode: 'dialog',
			})
		);
		render(<ToolBar />);
		fireEvent.click(screen.getByTestId('icon-undo').parentElement!);
		expect(mockDialogUndo).toHaveBeenCalled();

		fireEvent.click(screen.getByTestId('icon-redo').parentElement!);
		expect(mockDialogRedo).toHaveBeenCalled();
	});

	it('should handle keyboard shortcuts for undo/redo in map mode', () => {
		render(<ToolBar />);
		fireEvent.keyDown(window, { key: 'z', ctrlKey: true });
		expect(mockMapUndo).toHaveBeenCalled();

		fireEvent.keyDown(window, { key: 'y', ctrlKey: true });
		expect(mockMapRedo).toHaveBeenCalled();
	});
});