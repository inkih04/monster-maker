import './Layout.css';
import './LayoutCodeEditor.css';
import { useEngineStore } from '../ToolBar/EngineGState';
import Spacer from '../common/components/spacer/Spacer';
import {
	useLayoutCodeEditorResize,
	CODE_EDITOR_LIMITS,
} from './customHooks/useLayoutCodeEditorResize';
import MapPreview from '../Map/MapPreview/MapPreview';
import CodeEditor from '../CodeEditor/CodeEditor';
import { CodeEditorLoadingOverlay } from '../CodeEditor/CodeEditorLoadingOverlay';
import { useCodeEditorStore } from '../CodeEditor/CodeEditorGState';
import { updateLiveCssContent } from '../CodeEditor/monacoConfig';
import { useEffect } from 'react';
import { useEngineConfigStore } from '../Tagger/useEngineConfigStore';
import UiScriptPanel from './UiScriptPanel';
import { useTranslation } from 'react-i18next';
import { LocalizationTable } from '../DialogEditor/LocalizationTable';
import DialogEditor from '../DialogEditor/DialogEditor';

function LayoutCodeEditor() {
	const codeEditorMode = useEngineStore((state) => state.codeEditorMode);

	return (
		<div className="layoutCodeEditor--root">
			{codeEditorMode === null && <CodeEditorEmpty />}
			{codeEditorMode === 'single' && <CodeEditorSingle />}
			{codeEditorMode === 'duo' && <CodeEditorDuo />}
			{codeEditorMode === 'dialog' && <CodeEditorDialogDuo />}
			{codeEditorMode === 'json' && <CodeEditorMemory />}
		</div>
	);
}

function CodeEditorEmpty() {
	const { t } = useTranslation();
	return (
		<div className="layoutCodeEditor--empty">
			<div className="layoutCodeEditor--empty-bg" />
			<div className="layoutCodeEditor--empty-hint">
				<span>{t('noFileOpen')}</span>
			</div>
		</div>
	);
}

function CodeEditorSingle() {
	const openFile = useCodeEditorStore((state) => state.openFile);
	const updateContent = useCodeEditorStore((state) => state.updateContent);
	const tags = useEngineConfigStore((state) => state.tags);

	return (
		<div className="layoutCodeEditor--single" style={{ position: 'relative' }}>
			<CodeEditor
				language="lua"
				value={openFile?.content ?? ''}
				onChange={updateContent}
				tags={tags}
			/>
			<CodeEditorLoadingOverlay />
		</div>
	);
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

	const openUiFile = useCodeEditorStore((state) => state.openUiFile);
	const updateHtmlContent = useCodeEditorStore((state) => state.updateHtmlContent);
	const updateCssContent = useCodeEditorStore((state) => state.updateCssContent);

	useEffect(() => {
		updateLiveCssContent(openUiFile?.cssContent ?? '');
	}, [openUiFile?.cssContent]);

	return (
		<div className="layoutCodeEditor--duo" style={{ position: 'relative' }}>
			<aside
				className="layoutCodeEditor--duo-aside"
				style={{ flex: `0 0 ${leftPanelWidth}px`, minWidth: CODE_EDITOR_LIMITS.leftPanelWidth.min }}
			>
				<CodeEditor
					language="html"
					value={openUiFile?.htmlContent ?? ''}
					onChange={updateHtmlContent}
				/>
			</aside>

			<Spacer direction="vertical" resizable onResize={resizeLeftPanel} />

			<div className="layoutCodeEditor--duo-main">
				<CodeEditor
					language="css"
					value={openUiFile?.cssContent ?? ''}
					onChange={updateCssContent}
				/>
			</div>

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
				<div className="layoutCodeEditor--duo-options">
					<UiScriptPanel />
				</div>
			</aside>

			<CodeEditorLoadingOverlay />
		</div>
	);
}

function CodeEditorDialogDuo() {
	const { leftPanelWidth, resizeLeftPanel } = useLayoutCodeEditorResize();

	return (
		<div className="layoutCodeEditor--DialogEditor-root" style={{ position: 'relative' }}>
			<aside
				className="layoutCodeEditor--DialogEditor-aside"
				style={{
					flex: `0 0 ${leftPanelWidth}px`,
					marginTop: '10px',
					minWidth: CODE_EDITOR_LIMITS.leftPanelWidth.min,
				}}
			>
				<DialogEditor />
			</aside>

			<Spacer direction="vertical" resizable onResize={resizeLeftPanel} />

			<div className="layoutCodeEditor--DialogEditor-main">
				<LocalizationTable />
			</div>
			<CodeEditorLoadingOverlay />
		</div>
	);
}

function CodeEditorMemory() {
	const openFile = useCodeEditorStore((state) => state.openFile);
	const updateContent = useCodeEditorStore((state) => state.updateContent);

	return (
		<div className="layoutCodeEditor--single" style={{ position: 'relative' }}>
			<CodeEditor language="json" value={openFile?.content ?? ''} onChange={updateContent} />
			<CodeEditorLoadingOverlay />
		</div>
	);
}

export default LayoutCodeEditor;
