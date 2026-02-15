import { Cube } from 'iconoir-react';
import { useState, useRef, useEffect } from 'react';
import Entity from '../../../domain/ecs/entity';
import { Tag, TAG_OPTIONS } from '../../../domain/ecs/tags';
;

interface EntityHeaderProps {
	entity: Entity;
	onUpdateName: (name: string) => void;
	onUpdateTag: (tag: Tag) => void;
}

function EntityHeader({ entity, onUpdateName, onUpdateTag }: EntityHeaderProps) {
	const [isEditingName, setIsEditingName] = useState(false);
	const [tempName, setTempName] = useState('');
	const [showTagDropdown, setShowTagDropdown] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const tagDropdownRef = useRef<HTMLDivElement>(null);

	const entityName = entity.name || 'GameObject';

	useEffect(() => {
		if (isEditingName && inputRef.current) {
			inputRef.current.focus();
			inputRef.current.select();
		}
	}, [isEditingName]);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (tagDropdownRef.current && !tagDropdownRef.current.contains(event.target as Node)) {
				setShowTagDropdown(false);
			}
		};

		if (showTagDropdown) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [showTagDropdown]);

	const handleNameClick = () => {
		setTempName(entityName);
		setIsEditingName(true);
	};

	const handleNameBlur = () => {
		if (tempName.trim()) {
			onUpdateName(tempName.trim());
		}
		setIsEditingName(false);
	};

	const handleNameKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			handleNameBlur();
		} else if (e.key === 'Escape') {
			setIsEditingName(false);
		}
	};

	const handleTagSelect = (tag: Tag) => {
		onUpdateTag(tag);
		setShowTagDropdown(false);
	};

	return (
		<>
			<div className="entity--row1">
				<Cube className="entity--cube" />
				<div className="entity--input-container entity--name-container">
					{isEditingName ? (
						<input
							ref={inputRef}
							type="text"
							value={tempName}
							onChange={(e) => setTempName(e.target.value)}
							onBlur={handleNameBlur}
							onKeyDown={handleNameKeyDown}
							className="entity--name-input"
						/>
					) : (
						<span onClick={handleNameClick} className="entity--name-span">
							{entityName}
						</span>
					)}
				</div>
			</div>
			<div className="entity--row2">
				<div className="entity--tag" ref={tagDropdownRef}>
					<span>Tag :</span>
					<button
						className="entity--input-container entity--tag-button"
						onClick={() => setShowTagDropdown(!showTagDropdown)}
					>
						{entity.tag || 'Untagged'}
					</button>
					{showTagDropdown && (
						<div className="entity--tag-dropdown">
							{TAG_OPTIONS.map((tag) => (
								<div
									key={tag}
									className={`entity--tag-option ${entity.tag === tag ? 'selected' : ''}`}
									onClick={() => handleTagSelect(tag)}
								>
									{tag}
								</div>
							))}
						</div>
					)}
				</div>
				<div className="entity--layer">
					<span>Layer :</span>
					<div className="entity--input-container">{entity.layer}</div>
				</div>
			</div>
		</>
	);
}

export default EntityHeader;