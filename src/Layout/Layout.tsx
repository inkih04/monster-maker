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
import { useLayoutResize, LIMITS } from './customHooks/useLayoutResize';
import { useEffect } from 'react';
import { useNotify } from '../common/components/toast/ToastContext';
import { useTranslation } from 'react-i18next';

function Layout() {
	const {
		mapUtilityWidth,
		entityWidth,
		filesHeight,
		filesMenuWidth,
		resizeMapUtility,
		resizeEntity,
		resizeFiles,
		resizeFilesMenu,
		resetLayout,
	} = useLayoutResize();

	const { notify } = useNotify();
	const { t } = useTranslation();

	useEffect(() => {
		const removeListener = window.api.onResetLayout(() => {
			resetLayout();
			notify(t('layout'), t('resetLayout'), 'success', 3000);
		});

		return () => {
			removeListener();
		};
	}, [resetLayout, notify, t]);

	return (
		<>
			<ModalProject />
			<CreateFile />
			<div className="content">
				<ToolBar />
				<main className="main" style={{ minHeight: 0 }}>
					<aside
						className="map-utility"
						style={{ flex: `0 0 ${mapUtilityWidth}px`, minWidth: LIMITS.mapUtilityWidth.min }}
					>
						<div className="tilemap-container">
							<TileSet />
						</div>
						<Spacer size="small" />
						<div className="maps"></div>
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
				</main>
				<Spacer direction="horizontal" resizable onResize={resizeFiles} />
				<div
					className="files"
					style={{ flex: `0 0 ${filesHeight}px`, minHeight: LIMITS.filesHeight.min }}
				>
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
				</div>
			</div>
		</>
	);
}

export default Layout;
