import { ReloadIcon } from '@radix-ui/react-icons';
import './MapLoadingOverlay.css';
import { useMapStore } from './MapGState';



export function MapLoadingOverlay() {
	const isLoaded = useMapStore((state) => state.isLoadingMap)
	if (!isLoaded) return null;

	return (
		<div className="map-loading-overlay" aria-busy="true">
			<div className="map-loading-content">
				<ReloadIcon
					className="map-loading-spinner"
					width={20}
					height={20}
				/>
			</div>
		</div>
	);
}
