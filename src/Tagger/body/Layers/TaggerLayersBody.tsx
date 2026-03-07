import { Eye, EyeClosed, Lock, LockSlash } from 'iconoir-react';
import { Layer } from '../../../domain/ecs/layer';
import { useMapStore } from '../../../Map/MapGState';
import '../TaggerBody.css';
import { useTranslation } from 'react-i18next';

const LAYER_ORDER: Layer[] = ['ground', 'decoration', 'entities', 'shadows', 'foreground'];

const LAYER_LABELS: Record<Layer, string> = {
	ground: 'Ground',
	decoration: 'Decoration',
	entities: 'Entities',
	shadows: 'Shadows',
	foreground: 'Foreground',
};

function TaggerLayersBody() {
	const visibleLayers = useMapStore((state) => state.visibleLayers);
	const lockedLayers = useMapStore((state) => state.lockedLayers);
	const toggleLayerVisibility = useMapStore((state) => state.toggleLayerVisibility);
	const toggleLayerLocked = useMapStore((state) => state.toggleLayerLocked);
	const { t } = useTranslation();

	return (
		<div className="tagger-body--scroll">
			<ul className="tagger-layers--list">
				{LAYER_ORDER.map((layer) => {
					const visible = visibleLayers[layer];
					const locked = lockedLayers[layer];
					return (
						<li
							key={layer}
							className={`tagger-layers--row ${!visible ? 'is-hidden' : ''} ${locked ? 'is-locked' : ''}`}
						>
							<span className="tagger-layers--name">{LAYER_LABELS[layer]}</span>
							<div className="tagger-layers--actions">
								<button
									className={`tagger-layers--icon-btn ${!visible ? 'is-inactive' : ''}`}
									onClick={() => toggleLayerVisibility(layer)}
									title={visible ? t('showLayer') : t('hideLayer')}
								>
									{visible ? <Eye width={14} /> : <EyeClosed width={14} />}
								</button>
								<button
									className={`tagger-layers--icon-btn ${locked ? 'is-locked-btn' : ''}`}
									onClick={() => toggleLayerLocked(layer)}
									title={locked ? t('unlockLayer') : t('lockLayer')}
								>
									{locked ? <Lock width={14} /> : <LockSlash width={14} />}
								</button>
							</div>
						</li>
					);
				})}
			</ul>
		</div>
	);
}

export default TaggerLayersBody;
