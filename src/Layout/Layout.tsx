import './Layout.css';
import Spacer from '../common/components/spacer/Spacer';
import ToolBar from '../ToolBar/ToolBar';
import TileSet from '../Tileset/TileSet';
import Map from '../Map/Map';

function Layout() {
	return (
		<div className="content">
			<ToolBar/>
			<main className="main">
				<aside className="map-utility">
					<div className="tilemap-container">
						<TileSet />
					</div>
					<Spacer size="small" />
					<div className="maps"></div>
				</aside>
				<div className="map">
					<Spacer direction="vertical" />
					<div className="map-container">
						<Map />
					</div>
				</div>
				<aside className="entity">
					<Spacer direction="vertical" />
				</aside>
			</main>
			<div className="files">
				<Spacer />
				<div className="files-content">
					<aside className="files-menu"></aside>
					<Spacer direction="vertical" size="small" />
					<aside className="raw-files"></aside>
				</div>
			</div>
		</div>
	);
}

export default Layout;
