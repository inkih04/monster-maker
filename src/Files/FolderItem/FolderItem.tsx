import { Folder } from 'iconoir-react';
import './FolderItem.css';
import type FolderNode from '../../../global/types/folderNode';
import { useFolderStore } from '../../common/globalStores/useFolderStore';

interface FolderItemProps {
	folder: FolderNode;
	level: number;
}

export function FolderItem({ folder, level }: Readonly<FolderItemProps>) {
	const setSelectedFolder = useFolderStore((state) => state.setSelectedFolder);
	const selectedFolder = useFolderStore((state) => state.selectedFolder);
	const isSelected = selectedFolder?.path === folder.path;

	const handleClick = () => {
		setSelectedFolder(folder);
	};

	return (
		<>
			<button
				className={`folders--item folders--level-${level} ${isSelected ? 'folders--selected' : ''}`}
				onClick={handleClick}
			>
				<Folder width={18} height={18} className="folders--icon" />
				<span className="folders--name">{folder.name}</span>
			</button>
			{folder.children?.map((child) => (
				<FolderItem key={child.path} folder={child} level={level + 1} />
			))}
		</>
	);
}
