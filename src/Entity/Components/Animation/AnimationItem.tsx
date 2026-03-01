import { PlaySolid, PauseSolid, Trash } from 'iconoir-react';
import FrameStrip from './FrameStrip';
import { Animation } from '../../../domain/ecs/components';
import { BASIC_ANIMATION_NAMES, DEFAULT_SET } from './customHooks/useAnimationInspector';

interface AnimationItemProps {
	anim: Animation;
	setName: string;
	index: number;
	isOpen: boolean;
	isPreviewing: boolean;
	imageUrl: string | null;
	cellW: number;
	cellH: number;
	previewFrame: number;
	onToggle: (index: number | null) => void;
	onUpdate: (setName: string, index: number, changes: Partial<Animation>) => void;
	onDelete: (setName: string, index: number) => void;
	onStartPreview: (anim: Animation) => void;
	onStopPreview: () => void;
	onRemoveFrame: (setName: string, animIndex: number, frameIndex: number) => void;
	onMoveFrame: (setName: string, animIndex: number, from: number, to: number) => void;
}

function AnimationItem({
	anim,
	setName,
	index,
	isOpen,
	isPreviewing,
	imageUrl,
	cellW,
	cellH,
	previewFrame,
	onToggle,
	onUpdate,
	onDelete,
	onStartPreview,
	onStopPreview,
	onRemoveFrame,
	onMoveFrame,
}: Readonly<AnimationItemProps>) {
	const isBasic = BASIC_ANIMATION_NAMES.includes(anim.name as (typeof BASIC_ANIMATION_NAMES)[number]);
	const nameLocked = setName === DEFAULT_SET && isBasic;

	return (
		<div className={`animation--item ${isOpen ? 'animation--item--open' : ''}`}>
			<div className="animation--item-header" onClick={() => onToggle(isOpen ? null : index)}>
				<span className="animation--chevron">{isOpen ? '▾' : '▸'}</span>

				<input
					value={anim.name}
					className="animation--name-input"
					style={{ fontWeight: isOpen ? 600 : 400, opacity: nameLocked ? 0.6 : 1 }}
					readOnly={nameLocked}
					title={nameLocked ? 'Basic animations cannot be renamed' : undefined}
					onClick={(e) => e.stopPropagation()}
					onChange={(e) => !nameLocked && onUpdate(setName, index, { name: e.target.value })}
				/>

				<span className="animation--frame-count">{anim.frames.length}f</span>

				{imageUrl && anim.frames.length > 0 && (
					<button
						className={`animation--icon-btn ${isPreviewing ? 'animation--icon-btn--active' : ''}`}
						title={isPreviewing ? 'Stop preview' : 'Preview'}
						onClick={(e) => {
							e.stopPropagation();
							if (isPreviewing) {
								onStopPreview();
							} else {
								onStartPreview(anim);
								onToggle(index);
							}
						}}
					>
						{isPreviewing
							? <PauseSolid width={12} height={12} />
							: <PlaySolid width={12} height={12} />
						}
					</button>
				)}

				{!nameLocked && (
					<button
						className="animation--icon-btn animation--icon-btn--danger"
						onClick={(e) => { e.stopPropagation(); onDelete(setName, index); }}
					>
						<Trash width={12} height={12} />
					</button>
				)}
			</div>

			{isOpen && (
				<div className="animation--item-body">
					<div className="animation--props-row">
						<label className="animation--prop-label">
							duration
							<input
								type="number"
								value={anim.frameDuration}
								min={1}
								onChange={(e) => onUpdate(setName, index, { frameDuration: +e.target.value })}
								className="animation--prop-input"
								style={{ width: 50 }}
							/>
							<span className="animation--prop-unit">ms</span>
						</label>
						<label className="animation--prop-label">
							<input
								type="checkbox"
								checked={anim.loop}
								onChange={(e) => onUpdate(setName, index, { loop: e.target.checked })}
								style={{ accentColor: 'var(--color-8)' }}
							/>
							loop
						</label>
					</div>

					<div className="animation--strip-row">
						{imageUrl && (
							<FrameStrip
								frames={anim.frames}
								imageUrl={imageUrl}
								cellW={cellW}
								cellH={cellH}
								onRemove={(fi) => onRemoveFrame(setName, index, fi)}
								onMove={(from, to) => onMoveFrame(setName, index, from, to)}
							/>
						)}

						{imageUrl && anim.frames.length > 0 && (() => {
							const f = anim.frames[previewFrame % anim.frames.length];
							return (
								<div className="animation--preview">
									<img
										src={imageUrl}
										draggable={false}
										alt=""
										style={{
											imageRendering: 'pixelated',
											position: 'absolute',
											left: -f.x * (52 / cellW),
											top: -f.y * (52 / cellH),
											transform: `scale(${52 / cellW})`,
											transformOrigin: '0 0',
										}}
									/>
								</div>
							);
						})()}
					</div>
				</div>
			)}
		</div>
	);
}

export default AnimationItem;