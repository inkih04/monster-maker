import React, { useState } from 'react';
import { Code, Folder, Xmark } from 'iconoir-react';
import { useCodeEditorStore } from '../CodeEditor/CodeEditorGState';
import { useProjectStore } from '../Project/ProjectConfigGState';
import { useFolderStore } from '../common/globalStores/useFolderStore';
import './UiScriptPanel.css';

const UiScriptPanel = () => {
	const openUiFile = useCodeEditorStore((state) => state.openUiFile);
	const updateScriptPath = useCodeEditorStore((state) => state.updateScriptPath);
	const currentProject = useProjectStore((state) => state.currentProject);
	const selectedFolder = useFolderStore((state) => state.selectedFolder);

	const [dragState, setDragState] = useState<'none' | 'valid' | 'invalid'>('none');

	if (!openUiFile) return null;

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		updateScriptPath(e.target.value);
	};

	const handleClear = () => {
		updateScriptPath(null);
	};

	const handleSelectFile = async () => {
		if (!window.api?.selectFile) return;
		if (!currentProject) return;

		const currentDir = await window.api.pathUnion(currentProject.path, currentProject.name);
		const result = await window.api.selectFile(currentDir || undefined, [
			{ name: 'Lua Scripts', extensions: ['lua'] },
			{ name: 'All Files', extensions: ['*'] },
		]);

		if (!result.success || !result.path) return;

		const relative = await window.api.toRelativePath(result.path);
		const finalPath = relative.success ? relative.path : result.path;

		updateScriptPath(finalPath ?? null);
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

		const finalPath = await window.api.pathUnion(selectedFolder.path, file.path);
		updateScriptPath(finalPath ?? null);
	};

	const dragClass =
		dragState === 'valid'
			? 'uiScriptPanel--drag-valid'
			: dragState === 'invalid'
				? 'uiScriptPanel--drag-invalid'
				: '';

	return (
		<div className="uiScriptPanel--root">
			<div className="uiScriptPanel--header">
				<div className="uiScriptPanel--header-left">
					<Code className="uiScriptPanel--header-icon" />
					<span>Script</span>
				</div>
			</div>

			<div className="uiScriptPanel--body">
				<div className="uiScriptPanel--row">
					<span>Path:</span>

					<div
						className={`uiScriptPanel--input-wrapper ${dragClass}`}
						onDragOver={handleDragOver}
						onDragLeave={handleDragLeave}
						onDrop={handleDrop}
					>
						<input
							type="text"
							className="render-input uiScriptPanel--input-path"
							value={openUiFile.scriptPath ?? ''}
							onChange={handleChange}
							placeholder="path/to/script.lua"
							spellCheck={false}
						/>
						<button
							type="button"
							className="uiScriptPanel--input-folder"
							onClick={handleSelectFile}
							title="Select file"
						>
							<Folder className="uiScriptPanel--folder-icon" />
						</button>
					</div>

					{openUiFile.scriptPath && (
						<button
							type="button"
							className="uiScriptPanel--clear"
							onClick={handleClear}
							title="Clear script"
						>
							<Xmark width={14} height={14} />
						</button>
					)}
				</div>
			</div>
		</div>
	);
};

export default UiScriptPanel;
