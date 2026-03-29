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
	CodeBrackets,
	Codepen,
	ChatBubbleTranslate,
} from 'iconoir-react';
import './ToolBar.css';
import { useToolsStore } from './ToolBarGState';
import { useMapStore } from '../Map/MapGState';
import { useEffect } from 'react';
import { useProjectStore } from '../Project/ProjectConfigGState';
import { useEngineStore } from './EngineGState';
import { useNotify } from '../common/components/toast/ToastContext';
import { useTranslation } from 'react-i18next';

function ToolBar() {
	const activeTool = useToolsStore((state) => state.activeTool);
	const setActiveTool = useToolsStore((state) => state.setActiveTool);
	const currentProject = useProjectStore((state) => state.currentProject);
	const currentMapPath = useMapStore((state) => state.mapRelativePath);
	const isMapDirty = useMapStore((state) => state.isDirty);
	const { undo, redo } = useMapStore.temporal.getState();
	const { t } = useTranslation();
	const isTranslateMode = useEngineStore((state) => state.translate);
	const changeTranslateMode = useEngineStore((state) => state.changeTranslate);
	const editorMode = useEngineStore((state) => state.editorMode);
	const changeEditorMode = useEngineStore((state) => state.changeEditorMode);
	const isRunning = useEngineStore((state) => state.isRunning);
	const runMode = useEngineStore((state) => state.runMode);
	const setEngineRunning = useEngineStore((state) => state.setEngineRunning);
	const resetEngineState = useEngineStore((state) => state.resetEngineState);
	const { notify } = useNotify();

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			console.log(editorMode);
			if (editorMode === 'map' && e.ctrlKey && e.key === 'z') {
				e.preventDefault();
				undo();
			}
			if (editorMode === 'map' && e.ctrlKey && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) {
				e.preventDefault();
				redo();
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [undo, redo]);

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
		if (isMapDirty) {
			notify(
				t('engine.notifications.warning_title'),
				t('engine.notifications.map_dirty'),
				'error',
				2000
			);
		}

		try {
			setEngineRunning(true);
			useEngineStore.setState({ runMode: 'play' });

			const result = await window.api.runEngine(currentProject);

			if (result.success) {
				console.log('Engine started successfully in PLAY mode');
				notify(t('engine.notifications.title'), t('engine.notifications.success_play'), 'success');
			} else {
				console.error('Failed to start engine:', result.error);
				notify(t('engine.notifications.title'), t('engine.notifications.fail_start'), 'error');
				resetEngineState();
			}
		} catch (error) {
			console.error('Error running engine:', error);
			notify(t('engine.notifications.title'), t('engine.notifications.fail_start'), 'error');
			resetEngineState();
		}
	};

	const handleDebug = async () => {
		if (!currentProject) {
			return;
		}

		if (!currentMapPath) {
			return;
		}

		if (isRunning) {
			return;
		}

		if (isMapDirty) {
			notify(
				t('engine.notifications.warning_title'),
				t('engine.notifications.map_dirty'),
				'error',
				2000
			);
		}

		try {
			setEngineRunning(true);
			useEngineStore.setState({ runMode: 'debug' });

			const result = await window.api.runEngine(currentProject, currentMapPath);

			if (result.success) {
				console.log('Engine started successfully in DEBUG mode with map:', currentMapPath);
				notify(
					t('engine.notifications.title'),
					t('engine.notifications.success_debug', { map: currentMapPath.split('/').pop() }),
					'success'
				);
			} else {
				notify(t('engine.notifications.title'), t('engine.notifications.fail_start'), 'error');
				resetEngineState();
			}
		} catch (error) {
			console.error('Error running engine:', error);
			notify(t('engine.notifications.title'), t('engine.notifications.fail_start'), 'error');
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
				{editorMode === 'map' && (
					<button
						onClick={() => changeEditorMode('code')}
						className={`tool-button ${isTranslateMode ? 'disabled' : ''}`}
						disabled={isTranslateMode}
					>
						<CodeBrackets />
					</button>
				)}
				{editorMode === 'code' && (
					<button
						onClick={() => changeEditorMode('map')}
						className={`tool-button ${isTranslateMode ? 'disabled' : ''}`}
						disabled={isTranslateMode}
					>
						<Codepen />
					</button>
				)}

				<button
					onClick={() => changeTranslateMode(!isTranslateMode)}
					className={`tool-button ${isTranslateMode ? 'active' : ''}`}
				>
					<ChatBubbleTranslate />
				</button>
			</div>
			<div className="other-tools">
				<button
					onClick={() => {
						redo();
					}}
					className={`tool-button ${editorMode === 'code' ? 'disabled' : ''}`}
					disabled={editorMode === 'code'}
				>
					<Redo />
				</button>
				<button
					onClick={() => {
						undo();
					}}
					className={`tool-button ${editorMode === 'code' ? 'disabled' : ''}`}
					disabled={editorMode === 'code'}
				>
					<Undo />
				</button>
			</div>
		</div>
	);
}

export default ToolBar;
