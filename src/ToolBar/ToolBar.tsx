import {
	Cube,
	Redo,
	Undo,
	EraseSolid,
	EditPencil,
	OneFingerSelectHandGesture,
	Play,
	DragHandGesture,
	Square,
	Bug,
} from 'iconoir-react';
import './ToolBar.css';
import { useToolsStore } from './ToolBarGState';
import { useMapStore } from '../Map/MapGState';
import { useEffect } from 'react';
import { useProjectStore } from '../Project/ProjectConfigGState';
import { useEngineStore } from './EngineGState';

function ToolBar() {
	const activeTool = useToolsStore((state) => state.activeTool);
	const setActiveTool = useToolsStore((state) => state.setActiveTool);
	const currentProject = useProjectStore((state) => state.currentProject);
	const currentMapPath = useMapStore((state) => state.mapRelativePath);
	const { undo, redo } = useMapStore.temporal.getState();

	const isRunning = useEngineStore((state) => state.isRunning);
	const runMode = useEngineStore((state) => state.runMode);
	const setEngineRunning = useEngineStore((state) => state.setEngineRunning);
	const resetEngineState = useEngineStore((state) => state.resetEngineState);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.ctrlKey && e.key === 'z') {
				e.preventDefault();
				undo();
			}
			if (e.ctrlKey && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) {
				e.preventDefault();
				redo();
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [undo, redo]);

	useEffect(() => {
		const cleanup = window.api.onEngineExit(() => {
			console.log('Engine exited, resetting state');
			resetEngineState();
		});

		return cleanup;
	}, [resetEngineState]);

	const shouldShowPause = (): boolean => {
		return isRunning;
	};

	const shouldDisablePlay = (): boolean => {
		return isRunning && runMode === 'debug';
	};

	const shouldDisableDebug = (): boolean => {
		return (isRunning && runMode === 'play') || currentMapPath === null;
	};

	const handlePlay = async () => {
		if (!currentProject) {
			return;
		}

		if (isRunning) {
			return;
		}
		try {
			setEngineRunning(true);
			useEngineStore.setState({ runMode: 'play' });

			const result = await window.api.runEngine(currentProject);

			if (result.success) {
				console.log('Engine started successfully in PLAY mode');
			} else {
				console.error('Failed to start engine:', result.error);
				resetEngineState();
			}
		} catch (error) {
			console.error('Error running engine:', error);
			resetEngineState();
		}
	};

	const handleDebug = async () => {
		if (!currentProject) {
			console.error('No project selected');
			return;
		}

		if (!currentMapPath) {
			console.error('No map opened for debugging');
			return;
		}

		if (isRunning) {
			console.warn('Engine is already running');
			return;
		}

		try {
			setEngineRunning(true);
			useEngineStore.setState({ runMode: 'debug' });

			const result = await window.api.runEngine(currentProject, currentMapPath);

			if (result.success) {
				console.log('Engine started successfully in DEBUG mode with map:', currentMapPath);
			} else {
				console.error('Failed to start engine:', result.error);
				resetEngineState();
			}
		} catch (error) {
			console.error('Error running engine:', error);
			resetEngineState();
		}
	};

	const handleStop = async () => {
		try {
			const result = await window.api.stopEngine();

			if (result.success) {
				console.log('Engine stopped successfully');
				resetEngineState();
			} else {
				console.error('Failed to stop engine:', result.error);
			}
		} catch (error) {
			console.error('Error stopping engine:', error);
		}
	};

	return (
		<div className="tools-container">
			<div className="tools">
				<button
					className={`tool-button ${activeTool === 'entity' ? 'active' : ''}`}
					onClick={() => setActiveTool('entity')}
				>
					<Cube />
				</button>

				<button
					className={`tool-button ${activeTool === 'eraser' ? 'active' : ''}`}
					onClick={() => setActiveTool('eraser')}
				>
					<EraseSolid />
				</button>

				<button
					className={`tool-button ${activeTool === 'brush' ? 'active' : ''}`}
					onClick={() => setActiveTool('brush')}
				>
					<EditPencil />
				</button>

				<button
					className={`tool-button ${activeTool === 'select' ? 'active' : ''}`}
					onClick={() => setActiveTool('select')}
				>
					<OneFingerSelectHandGesture />
				</button>

				<button
					className={`tool-button ${activeTool === 'area-copy' ? 'active' : ''}`}
					onClick={() => setActiveTool('area-copy')}
				>
					<DragHandGesture />
				</button>
			</div>
			<div className="action-buttons">
				{runMode === 'debug' && (
					<>
						<button
							onClick={handlePlay}
							className={`tool-button ${shouldDisablePlay() ? 'disabled' : ''}`}
							disabled={shouldDisablePlay()}
						>
							<Play className="play-button" />
						</button>
						<button onClick={handleStop} className="tool-button">
							<Square className="pause-button" />
						</button>
					</>
				)}
				{runMode === 'play' && (
					<>
						<button onClick={handleStop} className="tool-button">
							<Square className="pause-button" />
						</button>
						<button
							onClick={handleDebug}
							className={`tool-button ${shouldDisableDebug() ? 'disabled' : ''}`}
							disabled={shouldDisableDebug()}
						>
							<Bug className="debug-botton" />
						</button>
					</>
				)}
				{runMode !== 'debug' && runMode !== 'play' && (
					<>
						<button
							onClick={handlePlay}
							className={`tool-button ${shouldDisablePlay() ? 'disabled' : ''}`}
							disabled={shouldDisablePlay()}
						>
							<Play className="play-button" />
						</button>
						<button
							onClick={handleDebug}
							className={`tool-button ${shouldDisableDebug() ? 'disabled' : ''}`}
							disabled={shouldDisableDebug()}
						>
							<Bug className="debug-botton" />
						</button>
					</>
				)}
			</div>
			<div className="other-tools">
				<button
					onClick={() => {
						redo();
					}}
					className="tool-button"
				>
					<Redo />
				</button>
				<button
					onClick={() => {
						undo();
					}}
					className="tool-button"
				>
					<Undo />
				</button>
			</div>
		</div>
	);
}

export default ToolBar;
