import './Layout.css';
import Spacer from '../common/components/spacer/Spacer';
import ToolBar from '../ToolBar/ToolBar';
import TileSet from '../Tileset/TileSet';
import Map from '../Map/Map';
import ModalProject from '../Project/ModalProject';
import FolderTree from '../Files/FolderTree';
import FileList from '../Files/FileList';
import CreateFile from '../common/components/createFile/CreateFile';
import Entity from '../Entity/Entity';
import DebugTerminal from '../DebugTerminal/DebugTerminal';
import { useLayoutResize, LIMITS } from './customHooks/useLayoutResize';
import { useEffect } from 'react';
import { useNotify } from '../common/components/toast/ToastContext';
import { useTranslation } from 'react-i18next';
import { useEngineStore } from '../ToolBar/EngineGState';
import Tagger from '../Tagger/Tagger';
import LayoutCodeEditor from './LayoutCodeEditor';
import { useLayoutCodeEditorResize } from './customHooks/useLayoutCodeEditorResize';
import { useCodeEditorStore } from '../CodeEditor/CodeEditorGState';
import { LocalizationTable } from '../DialogEditor/LocalizationTable';

function Layout() {
	const {
		mapUtilityWidth,
		entityWidth,
		filesHeight,
		filesMenuWidth,
		tilesetHeight,
		resizeMapUtility,
		resizeEntity,
		resizeFiles,
		resizeFilesMenu,
		resetLayout,
		resizeTileset,
	} = useLayoutResize();

	const { resetCodeEditorLayout } = useLayoutCodeEditorResize();

	const { notify } = useNotify();
	const { t } = useTranslation();

	const isTranslateMode = useEngineStore((state) => state.translate);
	const isRunning = useEngineStore((state) => state.isRunning);
	const mode = useEngineStore((state) => state.runMode);
	const editorMode = useEngineStore((state) => state.editorMode);
	const resetEngineState = useEngineStore((state) => state.resetEngineState);
	const isFileDirty = useCodeEditorStore(
		(state) => state.openFile?.isDirty ?? state.openUiFile?.isDirty ?? false
	);

	useEffect(() => {
		const removeListener = window.api.onResetLayout(() => {
			resetLayout();
			resetCodeEditorLayout();
			notify(t('layout'), t('resetLayout'), 'success', 3000);
		});

		return () => {
			removeListener();
		};
	}, [resetLayout, notify, t]);

	useEffect(() => {
		const removeListener = window.api.onEngineExit(() => {
			resetEngineState();
		});

		return () => {
			removeListener();
		};
	}, [resetEngineState]);

	const showDirtyGlow = editorMode === 'code' && isFileDirty;

	return (
		<>
			<ModalProject />
			<CreateFile />
			<div className="content">
				<div className={showDirtyGlow ? 'layout--toolbar-dirty' : undefined}>
					<ToolBar />
				</div>
				<main className="main" style={{ minHeight: 0 }}>
					<div style={{ display: editorMode === 'map' && !isTranslateMode ? 'contents' : 'none' }}>
						<aside
							className="map-utility"
							style={{ flex: `0 0 ${mapUtilityWidth}px`, minWidth: LIMITS.mapUtilityWidth.min }}
						>
							<div className="tilemap-container" style={{ flex: `0 0 ${tilesetHeight}px` }}>
								<TileSet />
							</div>
							<Spacer size="small" resizable onResize={resizeTileset} marginRight={false} />
							<div className="tagger" style={{ flex: '1 1 0', minHeight: 0, overflow: 'hidden' }}>
								<Tagger />
							</div>
						</aside>
						<Spacer direction="vertical" resizable onResize={resizeMapUtility} />
						<div className="map">
							<div className="map-container">
								<Map />
							</div>
						</div>
						<Spacer direction="vertical" resizable onResize={resizeEntity} />
						<aside
							className="entity"
							style={{ flex: `0 0 ${entityWidth}px`, minWidth: LIMITS.entityWidth.min }}
						>
							<div className="pre-entity">
								<Entity />
							</div>
						</aside>
					</div>
					{editorMode === 'code' && !isTranslateMode && <LayoutCodeEditor />}
					{isTranslateMode && (
						<div className="layoutCodeEditor--single" style={{ position: 'relative' }}>
							<LocalizationTable />
						</div>
					)}
				</main>
				<Spacer direction="horizontal" resizable onResize={resizeFiles} />
				<div
					className="files"
					style={{ flex: `0 0 ${filesHeight}px`, minHeight: LIMITS.filesHeight.min }}
				>
					{mode !== 'debug' && (
						<div className="files-content">
							<aside
								className="files-menu"
								style={{ flex: `0 0 ${filesMenuWidth}px`, minWidth: LIMITS.filesMenuWidth.min }}
							>
								<FolderTree />
							</aside>
							<Spacer direction="vertical" size="small" resizable onResize={resizeFilesMenu} />
							<aside className="raw-files">
								<FileList />
							</aside>
						</div>
					)}
					{isRunning && mode === 'debug' && (
						<div className="layout--debugTerminal">
							<DebugTerminal />
						</div>
					)}
				</div>
			</div>
		</>
	);
}

export default Layout;
