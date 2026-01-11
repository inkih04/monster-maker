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

function ToolBar() {
	return (
		<div className="tools-container">
			<div className="tools">
				<button className="tool-button">
					<Cube />
				</button>

				<button className="tool-button">
					<EraseSolid />
				</button>
				<button className="tool-button">
					<EditPencil />
				</button>
				<button className="tool-button">
					<OneFingerSelectHandGesture />
				</button>
				<button className="tool-button">
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
