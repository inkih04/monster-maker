import './Layout.css';
import './LayoutCodeEditor.css';
import { useEngineStore } from '../ToolBar/EngineGState';
import Spacer from '../common/components/spacer/Spacer';
import {
	useLayoutCodeEditorResize,
	CODE_EDITOR_LIMITS,
} from './customHooks/useLayoutCodeEditorResize';
import MapPreview from '../Map/MapPreview/MapPreview';


function LayoutCodeEditor() {
	const codeEditorMode = useEngineStore((state) => state.codeEditorMode);

	return (
		<div className="layoutCodeEditor--root">
			{codeEditorMode === null && <CodeEditorEmpty />}
			{codeEditorMode === 'single' && <CodeEditorSingle />}
			{codeEditorMode === 'duo' && <CodeEditorDuo />}
		</div>
	);
}

function CodeEditorEmpty() {
	return (
		<div className="layoutCodeEditor--empty">
			<div className="layoutCodeEditor--empty-bg" />
			<div className="layoutCodeEditor--empty-hint">
				<span>No file open</span>
			</div>
		</div>
	);
}

function CodeEditorSingle() {
	return <div className="layoutCodeEditor--single"></div>;
}

function CodeEditorDuo() {
	const {
		leftPanelWidth,
		rightPanelWidth,
		mapPreviewHeight,
		resizeLeftPanel,
		resizeRightPanel,
		resizeMapPreview,
	} = useLayoutCodeEditorResize();

	return (
		<div className="layoutCodeEditor--duo">
			<aside
				className="layoutCodeEditor--duo-aside"
				style={{ flex: `0 0 ${leftPanelWidth}px`, minWidth: CODE_EDITOR_LIMITS.leftPanelWidth.min }}
			>
			</aside>

			<Spacer direction="vertical" resizable onResize={resizeLeftPanel} />

			<div className="layoutCodeEditor--duo-main"></div>

			<Spacer direction="vertical" resizable onResize={resizeRightPanel} />

			<aside
				className="layoutCodeEditor--duo-aside"
				style={{
					flex: `0 0 ${rightPanelWidth}px`,
					minWidth: CODE_EDITOR_LIMITS.rightPanelWidth.min,
				}}
			>
				<div
					className="layoutCodeEditor--duo-preview"
					style={{ flex: `0 0 ${mapPreviewHeight}px` }}
				>
					<MapPreview />
				</div>
				<Spacer size="small" resizable onResize={resizeMapPreview} marginRight={false} />
				<div className="layoutCodeEditor--duo-options"></div>
			</aside>
		</div>
	);
}

export default LayoutCodeEditor;
