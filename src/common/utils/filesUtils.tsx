import TileMapIcon from '../../assets/img/TileMap.png';
import TileSetIcon from '../../assets/img/TileSet.png';
import LuaScriptIcon from '../../assets/img/LuaScript.png';

export function getFileIcon(type: string) {
	switch (type) {
		case 'script':
			return <img src={LuaScriptIcon} alt="Script" className="files--icon-img" />;
		case 'tilemap':
			return <img src={TileMapIcon} alt="Tilemap" className="files--icon-img" />;
		case 'tileset':
			return <img src={TileSetIcon} alt="Tileset" className="files--icon-img" />;
		default:
			return <img src={LuaScriptIcon} alt="File" className="files--icon-img" />;
	}
}

export function getFileType(fileName: string): 'script' | 'tilemap' | 'tileset' {
	const extension = fileName.split('.').pop()?.toLowerCase();

	if (extension === 'lua') return 'script';
	if (extension === 'tmx' || extension === 'json') return 'tilemap';
	if (extension === 'tsx' || extension === 'png') return 'tileset';

	return 'script';
}

export function getFileNameWithoutExtension(filePath: string): string {
	const fileName = filePath.split(/[/\\]/).pop() || filePath;
	const nameWithoutExt = fileName.split('.').slice(0, -1).join('.');
	return nameWithoutExt || fileName;
}
