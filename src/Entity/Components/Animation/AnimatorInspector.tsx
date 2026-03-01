import { Component, ComponentHeader, ComponentBody } from '../basic/InspectorComponent';
import { MediaImage, Plus } from 'iconoir-react';
import './Animation.css';

import { useState } from 'react';
import SpritePicker from './SpritePicker';
import AnimationItem from './AnimationItem';
import { useAnimationInspector } from './customHooks/useAnimationInspector';

function AnimationInspector() {
	const {
		imageUrl,
		cellW,
		cellH,
		data,
		activeAnim,
		previewFrame,
		currentAnim,
		spriteSheetPath,
		setCellW,
		setCellH,
		setActiveAnim,
		setDefaultAnimation,
		handleSelectSpritesheet,
		startPreview,
		addAnimation,
		deleteAnimation,
		updateAnim,
		toggleCell,
		removeFrame,
		moveFrame,
		stopPreview,
		isPreviewRunning,
	} = useAnimationInspector();

	const [isListOpen, setIsListOpen] = useState(true);
	const [isPickerOpen, setIsPickerOpen] = useState(true);

	return (
		<div className="animation--wrapper">
			<Component id="Animation">
				<ComponentHeader icon={MediaImage} onDelete={() => {}}>
					Animation
				</ComponentHeader>

				<ComponentBody>
					<div className="animation--load-row">
						<button
							className={`animation--load-btn ${spriteSheetPath ? 'animation--load-btn--loaded' : ''}`}
							onClick={handleSelectSpritesheet}
							title={spriteSheetPath || undefined}
						>
							{spriteSheetPath ? `✓ ${spriteSheetPath.split('/').pop()}` : '+ select spritesheet…'}
						</button>

						<label className="animation--cell-label">
							W
							<input
								type="number"
								value={cellW}
								min={1}
								onChange={(e) => setCellW(+e.target.value)}
								className="animation--cell-input"
							/>
						</label>
						<label className="animation--cell-label">
							H
							<input
								type="number"
								value={cellH}
								min={1}
								onChange={(e) => setCellH(+e.target.value)}
								className="animation--cell-input"
							/>
						</label>
					</div>
					{imageUrl && (
						<div className="animation--section">
							<div className="animation--section-header" onClick={() => setIsPickerOpen((v) => !v)}>
								<span className="animation--chevron">{isPickerOpen ? '▾' : '▸'}</span>
								<span className="animation--section-title">Spritesheet</span>
							</div>

							{isPickerOpen && (
								<div
									className={`animation--picker-wrap animation--picker-wrap--borderless ${activeAnim === null ? 'animation--picker-wrap--disabled' : ''}`}
								>
									{activeAnim === null && (
										<div className="animation--picker-hint">
											Select or create an animation below to start picking frames
										</div>
									)}
									<SpritePicker
										imageUrl={imageUrl}
										cellW={cellW}
										cellH={cellH}
										selectedCells={currentAnim?.frames ?? []}
										onToggleCell={toggleCell}
									/>
								</div>
							)}
						</div>
					)}
					<div className="animation--section">
						<div className="animation--section-header" onClick={() => setIsListOpen((v) => !v)}>
							<span className="animation--chevron">{isListOpen ? '▾' : '▸'}</span>
							<span className="animation--section-title">Animations</span>
							<span className="animation--frame-count">{data.animations.length}</span>
						</div>

						{isListOpen && (
							<>
								<div className="animation--list">
									{data.animations.map((anim, i) => (
										<AnimationItem
											key={i}
											anim={anim}
											index={i}
											isOpen={activeAnim === i}
											isDefault={data.defaultAnimation === anim.name}
											imageUrl={imageUrl}
											cellW={cellW}
											cellH={cellH}
											previewFrame={previewFrame}
											onToggle={setActiveAnim}
											onUpdate={updateAnim}
											onDelete={deleteAnimation}
											onStartPreview={startPreview}
											onSetDefault={setDefaultAnimation}
											onRemoveFrame={removeFrame}
											onMoveFrame={moveFrame}
											isPreviewing={activeAnim === i && isPreviewRunning}
											onStopPreview={stopPreview}
										/>
									))}
								</div>

								<button className="animation--add-btn" onClick={addAnimation}>
									<Plus width={12} height={12} />
									new animation
								</button>
							</>
						)}
					</div>
				</ComponentBody>
			</Component>
		</div>
	);
}

export default AnimationInspector;
