import { TaggerTab } from '../Tagger';
import TaggerGameConfigBody from './GameConfig/GameConfig';
import TaggerLayersBody from './Layers/TaggerLayersBody';
import TaggerShadersBody from './Shaders/TaggerShaderBody';
import TaggerTagsBody from './Tags/TaggerTagsBody';


type TaggerBodyProps = {
	activeTab: TaggerTab;
};

function TaggerBody({ activeTab }: TaggerBodyProps) {
	return (
		<div className="tagger-body--wrapper">
			{activeTab === 'layers' && <TaggerLayersBody />}
			{activeTab === 'shaders' && <TaggerShadersBody />}
			{activeTab === 'tags' && <TaggerTagsBody />}
			{activeTab === 'gameConfig' && <TaggerGameConfigBody />}
		</div>
	);
}

export default TaggerBody;
