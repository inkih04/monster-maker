import { useState } from 'react';
import { Plus, Trash } from 'iconoir-react';
import AnimationItem from './AnimationItem';
import { Animation, AnimationSet } from '../../../domain/ecs/components';
import { DEFAULT_SET, ActiveSelection } from './customHooks/useAnimationInspector';
import { useTranslation } from 'react-i18next';

interface AnimationSetSectionProps {
	setName: string;
	set: AnimationSet;
	selection: ActiveSelection;
	imageUrl: string | null;
	cellW: number;
	cellH: number;
	previewFrame: number;
	isPreviewRunning: boolean;
	onSetSelection: (sel: ActiveSelection) => void;
	onRenameSet: (oldName: string, newName: string) => void;
	onDeleteSet: (name: string) => void;
	onAddAnimation: (setName: string) => void;
	onUpdateAnim: (setName: string, index: number, patch: Partial<Animation>) => void;
	onDeleteAnim: (setName: string, index: number) => void;
	onStartPreview: (anim: Animation) => void;
	onStopPreview: () => void;
	onRemoveFrame: (setName: string, animIndex: number, frameIndex: number) => void;
	onMoveFrame: (setName: string, animIndex: number, from: number, to: number) => void;
}

function AnimationSetSection({
	setName,
	set,
	selection,
	imageUrl,
	cellW,
	cellH,
	previewFrame,
	isPreviewRunning,
	onSetSelection,
	onRenameSet,
	onDeleteSet,
	onAddAnimation,
	onUpdateAnim,
	onDeleteAnim,
	onStartPreview,
	onStopPreview,
	onRemoveFrame,
	onMoveFrame,
}: Readonly<AnimationSetSectionProps>) {
	const { t } = useTranslation();
	const [isOpen, setIsOpen] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [draftName, setDraftName] = useState(setName);
	const isDefault = setName === DEFAULT_SET;

	const commitRename = () => {
		setIsEditing(false);
		if (draftName !== setName) onRenameSet(setName, draftName);
	};

	const isAnimOpen = (i: number) => selection.setName === setName && selection.animIndex === i;
	const isPreviewing = (i: number) => isAnimOpen(i) && isPreviewRunning;

	const handleToggleAnim = (i: number | null) => {
		onSetSelection({ setName, animIndex: i });
	};

	return (
		<div className="animation--set">
			<div className="animation--set-header">
				<span
					className="animation--chevron"
					onClick={() => setIsOpen((v) => !v)}
					style={{ cursor: 'pointer' }}
				>
					{isOpen ? '▾' : '▸'}
				</span>

				{isEditing ? (
					<input
						className="animation--set-name-input"
						value={draftName}
						autoFocus
						onClick={(e) => e.stopPropagation()}
						onChange={(e) => setDraftName(e.target.value)}
						onBlur={commitRename}
						onKeyDown={(e) => {
							if (e.key === 'Enter') commitRename();
							if (e.key === 'Escape') {
								setDraftName(setName);
								setIsEditing(false);
							}
						}}
					/>
				) : (
					<span
						className="animation--set-name"
						onDoubleClick={() => !isDefault && setIsEditing(true)}
						title={isDefault ? undefined : t('animation.renameHint')}
					>
						{setName}
					</span>
				)}

				<span className="animation--frame-count">{set.animations.length}</span>

				{!isDefault && (
					<button
						className="animation--icon-btn animation--icon-btn--danger"
						title={t('animation.deleteSet')}
						onClick={() => onDeleteSet(setName)}
					>
						<Trash width={12} height={12} />
					</button>
				)}
			</div>

			{isOpen && (
				<>
					<div className="animation--list">
						{set.animations.map((anim, i) => (
							<AnimationItem
								key={i}
								anim={anim}
								setName={setName}
								index={i}
								isOpen={isAnimOpen(i)}
								isPreviewing={isPreviewing(i)}
								imageUrl={imageUrl}
								cellW={cellW}
								cellH={cellH}
								previewFrame={previewFrame}
								onToggle={handleToggleAnim}
								onUpdate={onUpdateAnim}
								onDelete={onDeleteAnim}
								onStartPreview={onStartPreview}
								onStopPreview={onStopPreview}
								onRemoveFrame={onRemoveFrame}
								onMoveFrame={onMoveFrame}
							/>
						))}
					</div>

					<button className="animation--add-btn" onClick={() => onAddAnimation(setName)}>
						<Plus width={12} height={12} />
						{t('animation.newAnimation')}
					</button>
				</>
			)}
		</div>
	);
}

export default AnimationSetSection;
