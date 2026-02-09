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

function ToolBar() {
	const activeTool = useToolsStore((state) => state.activeTool);
	const setActiveTool = useToolsStore((state) => state.setActiveTool);
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
				<button className="tool-button">
					<Play className="play-button" />
				</button>
			</div>
			<div className="other-tools">
				<button
					onClick={() => {
						console.log('redo');
						redo();
					}}
					className="tool-button"
				>
					<Redo />
				</button>
				<button
					onClick={() => {
						undo();
						console.log(undo);
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
