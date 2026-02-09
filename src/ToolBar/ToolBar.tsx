import {
	Cube,
	Redo,
	Undo,
	EraseSolid,
	EditPencil,
	OneFingerSelectHandGesture,
	Play,
	DragHandGesture,
} from 'iconoir-react';
import './ToolBar.css';
import { useToolsStore } from './ToolBarGState';
import { useMapStore } from '../Map/MapGState';
import { useEffect } from 'react';
import { useProjectStore } from '../Project/ProjectConfigGState';

function ToolBar() {
	const activeTool = useToolsStore((state) => state.activeTool);
	const setActiveTool = useToolsStore((state) => state.setActiveTool);
	const currentProject = useProjectStore((state) => state.currentProject);
	const { undo, redo } = useMapStore.temporal.getState();

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

	const play = async () => {
		if (!currentProject) {
			console.error('No project selected');
			return;
		}

		try {
			const result = await window.api.runEngine(currentProject);

			if (result.success) {
				console.log('Engine started successfully');
			} else {
				console.error('Failed to start engine:', result.error);
			}
		} catch (error) {
			console.error('Error running engine:', error);
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
			<div className="play-button">
				<button onClick={play} className="tool-button">
					<Play className="play-button" />
				</button>
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
