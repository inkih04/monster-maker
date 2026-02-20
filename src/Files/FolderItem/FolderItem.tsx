import { Folder } from 'iconoir-react';
import './FolderItem.css';
import type FolderNode from '../../../global/types/folderNode';
import { useFolderItemActions } from '../customHooks/useFolderItemActions';
import DeleteConfirmation from '../../common/components/delete/DeleteConfirmation';

interface FolderItemProps {
	folder: FolderNode;
	level: number;
}

export function FolderItem({ folder, level }: Readonly<FolderItemProps>) {
	const {
		isSelected,
		isCreatingHere,
		isConfirmingDelete,
		isContextMenuOpen,
		newFolderName,
		setNewFolderName,
		inputRef,
		handleClick,
		handleContextMenu,
		handleInputKeyDown,
		cancelCreation,
		cancelDeletion,
		confirmDeletion,
	} = useFolderItemActions(folder);

	return (
		<>
			<button
				className={`folders--item folders--level-${level} ${isSelected ? 'folders--selected' : ''} ${isContextMenuOpen ? 'folders--context-active' : ''}`}
				onClick={handleClick}
				onContextMenu={handleContextMenu}
			>
				<Folder width={18} height={18} className="folders--icon" />
				<span className="folders--name">{folder.name}</span>
			</button>

			{isCreatingHere && (
				<div className={`folders--new-folder-row folders--level-${level + 1}`}>
					<Folder width={18} height={18} className="folders--icon" />
					<input
						ref={inputRef}
						className="folders--new-folder-input"
						type="text"
						value={newFolderName}
						onChange={(e) => setNewFolderName(e.target.value)}
						onKeyDown={handleInputKeyDown}
						onBlur={cancelCreation}
						spellCheck={false}
					/>
				</div>
			)}

			<DeleteConfirmation
				open={isConfirmingDelete}
				onOpenChange={(open) => { if (!open) cancelDeletion(); }}
				itemName={folder.name}
				onConfirm={confirmDeletion}
			/>

			{folder.children?.map((child) => (
				<FolderItem key={child.path} folder={child} level={level + 1} />
			))}
		</>
	);
}