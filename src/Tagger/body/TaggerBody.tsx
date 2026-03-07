import { TaggerTab } from '../Tagger';
import TaggerLayersBody from './Layers/TaggerLayersBody';
import TaggerShadersBody from './Shaders/TaggerShaderBody';
import TaggerMapsBody from './Maps/TaggerMapsBody';

type TaggerBodyProps = {
	activeTab: TaggerTab;
};

function TaggerBody({ activeTab }: TaggerBodyProps) {
	return (
		<div className="tagger-body--wrapper">
			{activeTab === 'layers' && <TaggerLayersBody />}
			{activeTab === 'shaders' && <TaggerShadersBody />}
			{activeTab === 'maps' && <TaggerMapsBody />}
		</div>
	);
}

export default TaggerBody;
