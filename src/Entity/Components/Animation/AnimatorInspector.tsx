import { Component, ComponentHeader, ComponentBody } from '../basic/InspectorComponent';
import { MediaImage, Plus } from 'iconoir-react';
import './Animation.css';

import React, { useState } from 'react';
import SpritePicker from './SpritePicker';
import AnimationSetSection from './AnimationSetSection';
import { useAnimationInspector } from './customHooks/useAnimationInspector';
import { useMapStore } from '../../../Map/MapGState';
import { useFolderStore } from '../../../common/globalStores/useFolderStore';

function AnimationInspector() {
	const selectedEntityId = useMapStore((s) => s.selectedEntityId);
	const updateComponent = useMapStore((s) => s.updateComponent);

	const {
		imageUrl,
		cellW,
		cellH,
		sets,
		selection,
		previewFrame,
		currentAnim,
		spriteSheetPath,
		isPreviewRunning,
		setCellW,
		setCellH,
		setSelection,
		handleSelectSpritesheet,
		startPreview,
		stopPreview,
		addSet,
		deleteSet,
		renameSet,
		addAnimation,
		deleteAnimation,
		updateAnim,
		toggleCell,
		removeFrame,
		moveFrame,
		handleDelete,
	} = useAnimationInspector();

	const [isPickerOpen, setIsPickerOpen] = useState(false);
	const [dragState, setDragState] = useState<'none' | 'valid' | 'invalid'>('none');
	const [isSetsOpen, setIsSetsOpen] = useState(false);
	const [newSetName, setNewSetName] = useState('');
	const [isAddingSet, setIsAddingSet] = useState(false);
	const selectedFolder = useFolderStore((state) => state.selectedFolder);

	const handleAddSet = () => {
		if (!newSetName.trim()) return;
		addSet(newSetName.trim());
		setNewSetName('');
		setIsAddingSet(false);
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		const isTileset = e.dataTransfer.types.includes('file-type/tileset');
		const isFile = e.dataTransfer.types.some((t) => t.startsWith('file-type/'));
		if (!isFile) return;
		setDragState(isTileset ? 'valid' : 'invalid');
	};

	const handleDragLeave = () => setDragState('none');

	const handleDrop = async (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setDragState('none');
		const fileData = e.dataTransfer.getData('application/file-item');
		if (!fileData) return;
		const file = JSON.parse(fileData);
		if (file.type !== 'tileset') return;

		if (!selectedFolder) return;

		const finalPath = await window.api.pathUnion(selectedFolder?.path, file.path);

		if (selectedEntityId)
			updateComponent(selectedEntityId, 'RENDER', { spriteSheetPath: finalPath });
	};

	const pickerDisabled = selection.animIndex === null;

	return (
		<div className="animation--wrapper">
			<Component id="Animation">
				<ComponentHeader icon={MediaImage} onDelete={handleDelete}>
					Animation
				</ComponentHeader>

				<ComponentBody>
					<div
						className={`animation--load-row ${dragState === 'valid' ? 'animation--drag-valid' : ''} ${dragState === 'invalid' ? 'animation--drag-invalid' : ''}`}
						onDragOver={handleDragOver}
						onDragLeave={handleDragLeave}
						onDrop={handleDrop}
					>
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
								<>
									{pickerDisabled && (
										<div className="animation--picker-hint">
											Select an animation below to start picking frames
										</div>
									)}
									<div
										className={`animation--picker-wrap animation--picker-wrap--borderless ${pickerDisabled ? 'animation--picker-wrap--disabled' : ''}`}
									>
										<SpritePicker
											imageUrl={imageUrl}
											cellW={cellW}
											cellH={cellH}
											selectedCells={currentAnim?.frames ?? []}
											onToggleCell={toggleCell}
										/>
									</div>
								</>
							)}
						</div>
					)}

					<div className="animation--section">
						<div className="animation--section-header" onClick={() => setIsSetsOpen((v) => !v)}>
							<span className="animation--chevron">{isSetsOpen ? '▾' : '▸'}</span>
							<span className="animation--section-title">Animation Sets</span>
							<span className="animation--frame-count">{Object.keys(sets).length}</span>
						</div>

						{isSetsOpen && (
							<div className="animation--sets-body">
								{Object.entries(sets).map(([name, set]) => (
									<AnimationSetSection
										key={name}
										setName={name}
										set={set}
										selection={selection}
										imageUrl={imageUrl}
										cellW={cellW}
										cellH={cellH}
										previewFrame={previewFrame}
										isPreviewRunning={isPreviewRunning}
										onSetSelection={setSelection}
										onRenameSet={renameSet}
										onDeleteSet={deleteSet}
										onAddAnimation={addAnimation}
										onUpdateAnim={updateAnim}
										onDeleteAnim={deleteAnimation}
										onStartPreview={startPreview}
										onStopPreview={stopPreview}
										onRemoveFrame={removeFrame}
										onMoveFrame={moveFrame}
									/>
								))}

								{isAddingSet ? (
									<div className="animation--new-set-row">
										<input
											className="animation--new-set-input"
											placeholder="set name…"
											value={newSetName}
											autoFocus
											onChange={(e) => setNewSetName(e.target.value)}
											onKeyDown={(e) => {
												if (e.key === 'Enter') handleAddSet();
												if (e.key === 'Escape') {
													setIsAddingSet(false);
													setNewSetName('');
												}
											}}
										/>
										<button className="animation--icon-btn" onClick={handleAddSet}>
											✓
										</button>
										<button
											className="animation--icon-btn animation--icon-btn--danger"
											onClick={() => {
												setIsAddingSet(false);
												setNewSetName('');
											}}
										>
											✕
										</button>
									</div>
								) : (
									<button
										className="animation--add-btn animation--add-btn--set"
										onClick={() => setIsAddingSet(true)}
									>
										<Plus width={12} height={12} />
										new set
									</button>
								)}
							</div>
						)}
					</div>
				</ComponentBody>
			</Component>
		</div>
	);
}

export default AnimationInspector;
