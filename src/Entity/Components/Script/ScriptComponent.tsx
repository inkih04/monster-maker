import React, { useState, useCallback } from 'react';
import { Code, Folder, Plus, Trash } from 'iconoir-react';
import { Component, ComponentHeader, ComponentBody } from '../basic/InspectorComponent';
import './ScriptComponent.css';
import { useProjectStore } from '../../../Project/ProjectConfigGState';
import { useFolderStore } from '../../../common/globalStores/useFolderStore';
import { useComponentEditor } from '../basic/useComponentEditor';
import { useTranslation } from 'react-i18next';

type PropValue = string | number | boolean;
type ScriptProperties = Record<string, PropValue>;

interface PropRow {
	id: string;
	key: string;
	value: PropValue;
}

let _rowCounter = 0;
const newId = () => `row_${++_rowCounter}`;

const inferType = (raw: string): PropValue => {
	if (raw === 'true') return true;
	if (raw === 'false') return false;
	const num = Number(raw);
	if (!isNaN(num) && raw.trim() !== '') return num;
	return raw;
};

const propsToRows = (props: ScriptProperties): PropRow[] =>
	Object.entries(props).map(([key, value]) => ({ id: newId(), key, value }));

const rowsToProps = (rows: PropRow[]): ScriptProperties => {
	const result: ScriptProperties = {};
	for (const row of rows) result[row.key] = row.value;
	return result;
};

const getTypeLabel = (val: PropValue): string => {
	if (typeof val === 'boolean') return 'bool';
	if (typeof val === 'number') return 'num';
	return 'str';
};

const ScriptComponent = () => {
	const { entity, entityId, isMulti, count, update, remove } = useComponentEditor('SCRIPT');
	const currentProject = useProjectStore((state) => state.currentProject);
	const selectedFolder = useFolderStore((state) => state.selectedFolder);
	const [dragState, setDragState] = useState<'none' | 'valid' | 'invalid'>('none');
	const { t } = useTranslation();

	const scriptData = entity?.components?.SCRIPT;

	const [rows, setRows] = useState<PropRow[]>(() => propsToRows(scriptData?.properties ?? {}));

	const syncToStore = useCallback(
		(next: PropRow[]) => update({ properties: rowsToProps(next) }),
		[update]
	);

	if (!entityId || !scriptData) return null;


	const handleSelectFile = async () => {
		if (!window.api?.selectFile || !currentProject) return;
		const currentDir = await window.api.pathUnion(currentProject.path, currentProject.name);
		const result = await window.api.selectFile(currentDir || undefined);
		if (!result.success || !result.path) return;
		const relative = await window.api.toRelativePath(result.path);
		update({ path: relative.success ? relative.path : result.path });
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
		update({ path: await window.api.pathUnion(selectedFolder.path, file.path) });
	};

	const handleAddProp = () => {
		const next = [...rows, { id: newId(), key: '', value: '' as PropValue }];
		setRows(next);
		syncToStore(next);
	};

	const handleChangeKey = (id: string, newKey: string) => {
		const next = rows.map((r) => (r.id === id ? { ...r, key: newKey } : r));
		setRows(next);
		syncToStore(next);
	};

	const handleChangeValue = (id: string, raw: string) => {
		const next = rows.map((r) => (r.id === id ? { ...r, value: inferType(raw) } : r));
		setRows(next);
		syncToStore(next);
	};

	const handleDeleteProp = (id: string) => {
		const next = rows.filter((r) => r.id !== id);
		setRows(next);
		syncToStore(next);
	};


	return (
		<Component>
			<ComponentHeader icon={Code} onDelete={remove}>
				Script{isMulti && <span className="component-header--batch-badge">×{count}</span>}
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
							onChange={(e) => update({ path: e.target.value })}
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

				<div className="script--props-section">
					<div className="script--props-header">
						<span className="script--props-title">Props</span>
						<button
							type="button"
							className="script--props-add"
							onClick={handleAddProp}
							title="Add property"
						>
							<Plus width={12} height={12} />
						</button>
					</div>

					{rows.length > 0 ? (
						<div className="script--props-list">
							{rows.map((row) => (
								<div key={row.id} className="script--prop-row">
									<input
										type="text"
										className="script--prop-key"
										value={row.key}
										onChange={(e) => handleChangeKey(row.id, e.target.value)}
										spellCheck={false}
										placeholder="key"
									/>
									<span className="script--prop-sep">=</span>
									<input
										type="text"
										className="script--prop-value"
										value={String(row.value)}
										onChange={(e) => handleChangeValue(row.id, e.target.value)}
										spellCheck={false}
										placeholder="value"
									/>
									<span className="script--prop-type">{getTypeLabel(row.value)}</span>
									<button
										type="button"
										className="script--prop-delete"
										onClick={() => handleDeleteProp(row.id)}
										title="Remove property"
									>
										<Trash width={12} height={12} />
									</button>
								</div>
							))}
						</div>
					) : (
						<span className="script--props-empty">{t('properties')}</span>
					)}
				</div>
			</ComponentBody>
		</Component>
	);
};

export default ScriptComponent;
