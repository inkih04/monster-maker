import { PlaySolid, PauseSolid, Trash } from 'iconoir-react';
import FrameStrip from './FrameStrip';
import { Animation } from '../../../domain/ecs/components';

interface AnimationItemProps {
	anim: Animation;
	index: number;
	isOpen: boolean;
	isDefault: boolean;
	isPreviewing: boolean;
	imageUrl: string | null;
	cellW: number;
	cellH: number;
	previewFrame: number;
	onToggle: (index: number | null) => void;
	onUpdate: (index: number, changes: Partial<Animation>) => void;
	onDelete: (index: number) => void;
	onStartPreview: (anim: Animation) => void;
	onStopPreview: () => void;
	onSetDefault: (name: string | undefined) => void;
	onRemoveFrame: (frameIndex: number) => void;
	onMoveFrame: (from: number, to: number) => void;
}

function AnimationItem({
	anim,
	index,
	isOpen,
	isDefault,
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
	onSetDefault,
	onRemoveFrame,
	onMoveFrame,
}: Readonly<AnimationItemProps>) {
	return (
		<div className={`animation--item ${isOpen ? 'animation--item--open' : ''}`}>
			{/* ── Header ── */}
			<div className="animation--item-header" onClick={() => onToggle(isOpen ? null : index)}>
				<span className="animation--chevron">{isOpen ? '▾' : '▸'}</span>

				<input
					value={anim.name}
					className="animation--name-input"
					style={{ fontWeight: isOpen ? 600 : 400 }}
					onClick={(e) => e.stopPropagation()}
					onChange={(e) => onUpdate(index, { name: e.target.value })}
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

				<button
					className="animation--icon-btn animation--icon-btn--danger"
					onClick={(e) => {
						e.stopPropagation();
						onDelete(index);
					}}
				>
					<Trash width={12} height={12} />
				</button>
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
								onChange={(e) => onUpdate(index, { frameDuration: +e.target.value })}
								className="animation--prop-input"
								style={{ width: 50 }}
							/>
							<span className="animation--prop-unit">ms</span>
						</label>

						<label className="animation--prop-label">
							priority
							<input
								type="number"
								value={anim.priority}
								min={0}
								onChange={(e) => onUpdate(index, { priority: +e.target.value })}
								className="animation--prop-input"
								style={{ width: 38 }}
							/>
						</label>

						<label className="animation--prop-label">
							<input
								type="checkbox"
								checked={anim.loop}
								onChange={(e) => onUpdate(index, { loop: e.target.checked })}
								style={{ accentColor: 'var(--color-8)' }}
							/>
							loop
						</label>

						<label className="animation--prop-label">
							<input
								type="checkbox"
								checked={isDefault}
								onChange={(e) => onSetDefault(e.target.checked ? anim.name : undefined)}
								style={{ accentColor: 'var(--color-8)' }}
							/>
							default
						</label>
					</div>

					<div className="animation--strip-row">
						{imageUrl && (
							<FrameStrip
								frames={anim.frames}
								imageUrl={imageUrl}
								cellW={cellW}
								cellH={cellH}
								onRemove={onRemoveFrame}
								onMove={onMoveFrame}
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