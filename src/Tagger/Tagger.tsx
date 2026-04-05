import { useState } from 'react';
import { useProjectStore } from '../Project/ProjectConfigGState';
import TaggerBody from './body/TaggerBody';
import './Tagger.css';
import { useTranslation } from 'react-i18next';

export type TaggerTab = 'layers' | 'shaders' | 'tags' | 'gameConfig';

function Tagger() {
	const currentProject = useProjectStore((state) => state.currentProject);
	const [activeTab, setActiveTab] = useState<TaggerTab>('layers');
	const { t } = useTranslation();

	return (
		<div className={`tagger--container ${currentProject ? '' : 'is-tagger-empty'}`}>
			{currentProject && (
				<>
					<div className="tagger-header">
						<button
							className={`tagger--tab-button ${activeTab === 'layers' ? 'tagger--tab-active' : ''}`}
							onClick={() => setActiveTab('layers')}
						>
							{t('menu.map')}
						</button>
						<button
							className={`tagger--tab-button ${activeTab === 'shaders' ? 'tagger--tab-active' : ''}`}
							onClick={() => setActiveTab('shaders')}
						>
							Shaders
						</button>
						<button
							className={`tagger--tab-button ${activeTab === 'tags' ? 'tagger--tab-active' : ''}`}
							onClick={() => setActiveTab('tags')}
						>
							{t('maps')}
						</button>
						<button
							className={`tagger--tab-button ${activeTab === 'gameConfig' ? 'tagger--tab-active' : ''}`}
							onClick={() => setActiveTab('gameConfig')}
						>
							{t('gameConfig.tabLabel')}
						</button>
					</div>
					<div className="tagger--bodycontainer">
						<TaggerBody activeTab={activeTab} />
					</div>
				</>
			)}
		</div>
	);
}

export default Tagger;
