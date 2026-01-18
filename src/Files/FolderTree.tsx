import './FolderTree.css';
import { FolderItem } from './FolderItem/FolderItem';
import { useFolderTree } from '../common/customHooks/useFolderTree';
import { useProjectStore } from '../Project/ProjectConfigGState';

export default function FolderTree() {
	const { folderStructure, isLoading } = useFolderTree();
	const currentProject = useProjectStore((state) => state.currentProject);

	if (!currentProject || isLoading) {
		return null;
	}

	return (
		<div className="folders--container">
			{folderStructure.map((folder) => (
				<FolderItem key={folder.path} folder={folder} level={0} />
			))}
		</div>
	);
}
