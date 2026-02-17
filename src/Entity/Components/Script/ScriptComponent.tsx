import React, { useState } from 'react';
import { Code, Folder } from 'iconoir-react';
import { useMapStore } from '../../../Map/MapGState';
import { Component, ComponentHeader, ComponentBody } from '../basic/InspectorComponent';
import './ScriptComponent.css';
import { useProjectStore } from '../../../Project/ProjectConfigGState';
import { useFolderStore } from '../../../common/globalStores/useFolderStore';

const ScriptComponent = () => {
	const selectedEntityId = useMapStore((state) => state.selectedEntityId);
	const map = useMapStore((state) => state.map);
	const updateComponent = useMapStore((state) => state.updateComponent);
	const removeComponent = useMapStore((state) => state.removeComponent);
	const currentProject = useProjectStore((state) => state.currentProject);
	const selectedFolder = useFolderStore((state) => state.selectedFolder);
	const [dragState, setDragState] = useState<'none' | 'valid' | 'invalid'>('none');

	if (!selectedEntityId || !map) return null;
	const entity = map.entities[selectedEntityId];
	const scriptData = entity?.components?.SCRIPT;

	if (!scriptData) return null;

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		updateComponent(selectedEntityId, 'SCRIPT', {
			path: e.target.value,
		});
	};

	const handleSelectFile = async () => {
		if (!window.api?.selectFile) return;
		if (!currentProject) return;
		const currentDir = await window.api.pathUnion(currentProject?.path, currentProject?.name);
		const result = await window.api.selectFile(currentDir || undefined);
		if (!result.success || !result.path) return;

		const relative = await window.api.toRelativePath(result.path);
		const finalPath = relative.success ? relative.path : result.path;

		updateComponent(selectedEntityId, 'SCRIPT', { path: finalPath });
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		const isScript = e.dataTransfer.types.includes('file-type/script');
		const isFile = e.dataTransfer.types.some((t) => t.startsWith('file-type/'));
		if (!isFile) return;
		setDragState(isScript ? 'valid' : 'invalid');
	};

	const handleDragLeave = () => setDragState('none');

	const handleDrop = async (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setDragState('none');

		const fileData = e.dataTransfer.getData('application/file-item');
		if (!fileData) return;

		const file = JSON.parse(fileData);
		if (file.type !== 'script') return;

		if (!selectedFolder) return;

		const finalPath = await window.api.pathUnion(selectedFolder?.path, file.path);
		updateComponent(selectedEntityId, 'SCRIPT', { path: finalPath });
	};

	const handleDelete = () => {
		removeComponent(selectedEntityId, 'SCRIPT');
	};

	return (
		<Component>
			<ComponentHeader icon={Code} onDelete={handleDelete}>
				Script
			</ComponentHeader>
			<ComponentBody>
				<div className="Componet-input-row-path">
					<span>Path: </span>
					<div
						onDragOver={handleDragOver}
						onDragLeave={handleDragLeave}
						onDrop={handleDrop}
						className={`script--input-wrapper ${dragState === 'valid' ? 'script--drag-valid' : ''} ${dragState === 'invalid' ? 'script--drag-invalid' : ''}`}
					>
						<input
							type="text"
							className="render-input script--input-path"
							value={scriptData.path}
							onChange={handleChange}
							placeholder="path/to/script.lua"
							spellCheck={false}
						/>
						<button
							type="button"
							className="script--input-folder"
							onClick={handleSelectFile}
							title="Select file"
						>
							<Folder className="script--folder" />
						</button>
					</div>
				</div>
			</ComponentBody>
		</Component>
	);
};

export default ScriptComponent;
