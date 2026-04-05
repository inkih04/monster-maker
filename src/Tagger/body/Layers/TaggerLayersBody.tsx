import React, { useState } from 'react';
import { Eye, EyeClosed, Lock, LockSlash, Code, Folder, Xmark } from 'iconoir-react';
import { Layer } from '../../../domain/ecs/layer';
import { useMapStore } from '../../../Map/MapGState';
import { useProjectStore } from '../../../Project/ProjectConfigGState';
import { useFolderStore } from '../../../common/globalStores/useFolderStore';
import '../TaggerBody.css';
import { useTranslation } from 'react-i18next';

const LAYER_ORDER: Layer[] = ['ground', 'decoration', 'entities', 'shadows', 'foreground'];

const LAYER_LABELS: Record<Layer, string> = {
	ground: 'Ground',
	decoration: 'Decoration',
	entities: 'Entities',
	shadows: 'Shadows',
	foreground: 'Foreground',
};

function TaggerLayersBody() {
	const visibleLayers = useMapStore((state) => state.visibleLayers);
	const lockedLayers = useMapStore((state) => state.lockedLayers);
	const toggleLayerVisibility = useMapStore((state) => state.toggleLayerVisibility);
	const toggleLayerLocked = useMapStore((state) => state.toggleLayerLocked);
	const mapScript = useMapStore((state) => state.mapScript);
	const setMapScript = useMapStore((state) => state.setMapScript);
	const currentProject = useProjectStore((state) => state.currentProject);
	const selectedFolder = useFolderStore((state) => state.selectedFolder);
	const [dragState, setDragState] = useState<'none' | 'valid' | 'invalid'>('none');
	const { t } = useTranslation();

	const handleSelectFile = async () => {
		if (!window.api?.selectFile || !currentProject) return;
		const currentDir = await window.api.pathUnion(currentProject.path, currentProject.name);
		const result = await window.api.selectFile(currentDir || undefined);
		if (!result.success || !result.path) return;
		const relative = await window.api.toRelativePath(result.path);
		const finalPath = relative.success ? relative.path : result.path;
		if (!finalPath) return;
		setMapScript(finalPath);
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
		if (file.type !== 'script' || !selectedFolder) return;
		const finalPath = await window.api.pathUnion(selectedFolder.path, file.path);
		setMapScript(finalPath);
	};

	return (
		<div className="tagger-body--scroll">
			<ul className="tagger-layers--list">
				{LAYER_ORDER.map((layer) => {
					const visible = visibleLayers[layer];
					const locked = lockedLayers[layer];
					return (
						<li
							key={layer}
							className={`tagger-layers--row ${!visible ? 'is-hidden' : ''} ${locked ? 'is-locked' : ''}`}
						>
							<span className="tagger-layers--name">{LAYER_LABELS[layer]}</span>
							<div className="tagger-layers--actions">
								<button
									className={`tagger-layers--icon-btn ${!visible ? 'is-inactive' : ''}`}
									onClick={() => toggleLayerVisibility(layer)}
									title={visible ? t('showLayer') : t('hideLayer')}
								>
									{visible ? <Eye width={14} /> : <EyeClosed width={14} />}
								</button>
								<button
									className={`tagger-layers--icon-btn ${locked ? 'is-locked-btn' : ''}`}
									onClick={() => toggleLayerLocked(layer)}
									title={locked ? t('unlockLayer') : t('lockLayer')}
								>
									{locked ? <Lock width={14} /> : <LockSlash width={14} />}
								</button>
							</div>
						</li>
					);
				})}
			</ul>

			<div className="tagger-map-script--section">
				<div className="tagger-map-script--header">
					<Code width={12} className="tagger-map-script--header-icon" />
					<span className="tagger-map-script--label">Script</span>
					{mapScript && (
						<button
							className="tagger-map-script--clear-btn"
							onClick={() => setMapScript(null)}
							title={t('removeScript') ?? 'Remove script'}
						>
							<Xmark width={12} />
						</button>
					)}
				</div>
				<div
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					onDrop={handleDrop}
					className={`tagger-map-script--input-wrapper
						${dragState === 'valid' ? 'script--drag-valid' : ''}
						${dragState === 'invalid' ? 'script--drag-invalid' : ''}
						${dragState === 'none' && !mapScript ? 'tagger-map-script--empty' : ''}`}
				>
					<input
						type="text"
						className="tagger-kv--input tagger-map-script--input"
						value={mapScript ?? ''}
						onChange={(e) => setMapScript(e.target.value || null)}
						placeholder="path/to/script.lua"
						spellCheck={false}
					/>
					<button
						type="button"
						className="tagger-map-script--folder-btn"
						onClick={handleSelectFile}
						title="Select file"
					>
						<Folder width={14} />
					</button>
				</div>
			</div>
		</div>
	);
}

export default TaggerLayersBody;
