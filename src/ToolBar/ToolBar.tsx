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

function ToolBar() {
	const activeTool = useToolsStore((state) => state.activeTool);
	const setActiveTool = useToolsStore((state) => state.setActiveTool);

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
				<button className="tool-button">
					<Redo />
				</button>
				<button className="tool-button">
					<Undo />
				</button>
			</div>
		</div>
	);
}

export default ToolBar;
