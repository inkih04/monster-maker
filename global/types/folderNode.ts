export default interface FolderNode {
	name: string;
	path: string;
	children?: FolderNode[];
}