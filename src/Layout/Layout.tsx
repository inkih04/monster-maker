import './Layout.css';
import Spacer from '../common/components/spacer/Spacer';
import TileMap from '../tilemap/TileMap';

function Layout() {
  return (
    <div className="content">
      <div className="tools"></div>
      <main className="main">
        <aside className="map-utility">
          <div className="tilemap-container">
            <TileMap />
          </div>
          <Spacer size="small" />
          <div className="maps"></div>
        </aside>
        <div className="map">
          <Spacer direction="vertical" />
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
