export interface FileItem {
	name: string;
	path: string;
	type:
		| 'script'
		| 'tilemap'
		| 'tileset'
		| 'ui'
		| 'vertex'
		| 'fragment'
		| 'local'
		| 'dialog'
		| 'data';
}
