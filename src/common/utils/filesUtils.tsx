import TileMapIcon from '../../assets/img/TileMap.png';
import TileSetIcon from '../../assets/img/TileSet.png';
import LuaScriptIcon from '../../assets/img/LuaScript.png';
import FragmentShaderIcon from '../../assets/img/FragmentShader.png';
import VertexShaderIcon from '../../assets/img/VertexShader.png';
import musicIcon from '../../assets/img/music.png';
import undefined from '../../assets/img/Fichero.png';
import rmlui from '../../assets/img/Rmlui.png';
import fonts from '../../assets/img/fonts.png';
import dialog from '../../assets/img/Dialog.png'
import bd from '../../assets/img/bd.png';

export function getFileIcon(type: string) {
	switch (type) {
		case 'script':
			return <img src={LuaScriptIcon} alt="Script" className="files--icon-img" />;
		case 'tilemap':
			return <img src={TileMapIcon} alt="Tilemap" className="files--icon-img" />;
		case 'tileset':
			return <img src={TileSetIcon} alt="Tileset" className="files--icon-img" />;
		case 'vertex':
			return <img src={VertexShaderIcon} alt="vertexshader" className="files--icon-img" />;
		case 'fragment':
			return <img src={FragmentShaderIcon} alt="fragmentshader" className="files--icon-img" />;
		case 'music':
			return <img src={musicIcon} alt="music" className="files--icon-img" />;
		case 'ui':
			return <img src={rmlui} alt="ui" className="files--icon-img" />;
		case 'font':
			return <img src={fonts} alt="font" className="files--icon-img" />;
		case 'dialog':
			return <img src={dialog} alt="dialog" className="files--icon-img" />;
		case 'local':
			return <img src={dialog} alt="local" className="files--icon-img" />;
		case 'data':
			return <img src={bd} alt="local" className="files--icon-img" />;

		default:
			return <img src={undefined} alt="File" className="files--icon-img" />;
	}
}

export function getFileType(
	fileName: string
):
	| 'script'
	| 'tilemap'
	| 'tileset'
	| 'vertex'
	| 'fragment'
	| 'music'
	| 'ui'
	| 'font'
	| 'undefined'
	| 'dialog'
	| 'local'
	| 'data' {
	const extension = fileName.split('.').pop()?.toLowerCase();

	if (extension === 'lua') return 'script';
	if (extension === 'json') return 'dialog';
	if (extension === 'local') return 'local';
	if (extension === 'map') return 'tilemap';
	if (extension === 'tsx' || extension === 'png' || extension === 'jpg') return 'tileset';
	if (extension === 'vert') return 'vertex';
	if (extension === 'frag') return 'fragment';
	if (extension === 'waw' || extension === 'ogg' || extension === 'mp3' || extension === '.flac')
		return 'music';
	if (extension === 'ui') return 'ui';
	if (extension === 'ttf' || extension === 'otf' || extension === 'woff' || extension === 'wolff')
		return 'font';

	if (extension === 'data') return 'data';

	return 'undefined';
}

export function getFileNameWithoutExtension(filePath: string): string {
	const fileName = filePath.split(/[/\\]/).pop() || filePath;
	const nameWithoutExt = fileName.split('.').slice(0, -1).join('.');
	return nameWithoutExt || fileName;
}
