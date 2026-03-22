import { useEffect, useRef, useState } from 'react';
import { Plus, Xmark } from 'iconoir-react';
import '../TaggerBody.css';
import { useProjectStore } from '../../../Project/ProjectConfigGState';
import { useEngineConfigStore } from '../../useEngineConfigStore';
import { GameConfig } from '../../../../global/types/engineConfig';

type ConfigEntry = {
	id: string;
	key: string;
	value: string;
};

function gameConfigToEntries(gameConfig: GameConfig): ConfigEntry[] {
	return Object.entries(gameConfig).map(([key, value]) => ({
		id: crypto.randomUUID(),
		key,
		value: String(value),
	}));
}

function entriesToGameConfig(entries: ConfigEntry[]): GameConfig {
	const result: GameConfig = {};
	for (const entry of entries) {
		if (entry.key.trim() === '') continue;
		const raw = entry.value;
		if (raw === 'true') result[entry.key.trim()] = true;
		else if (raw === 'false') result[entry.key.trim()] = false;
		else if (raw !== '' && !isNaN(Number(raw))) result[entry.key.trim()] = Number(raw);
		else result[entry.key.trim()] = raw;
	}
	return result;
}

function TaggerGameConfigBody() {
	const currentProject = useProjectStore((s) => s.currentProject);
	const { gameConfig, isLoading, loadEngineConfig, saveGameConfig } = useEngineConfigStore();
	const [entries, setEntries] = useState<ConfigEntry[]>(() => gameConfigToEntries(gameConfig));
	const skipNextSync = useRef(false);

	useEffect(() => {
		if (!currentProject) return;
		loadEngineConfig(currentProject);
	}, [currentProject]);

	useEffect(() => {
		if (skipNextSync.current) {
			skipNextSync.current = false;
			return;
		}
		setEntries(gameConfigToEntries(gameConfig));
	}, [gameConfig]);

	const persist = (nextEntries: ConfigEntry[]) => {
		if (!currentProject) return;
		skipNextSync.current = true;
		saveGameConfig(currentProject, entriesToGameConfig(nextEntries));
	};

	const handleKeyChange = (id: string, value: string) => {
		const next = entries.map((e) => (e.id === id ? { ...e, key: value } : e));
		setEntries(next);
		persist(next);
	};

	const handleValueChange = (id: string, value: string) => {
		const next = entries.map((e) => (e.id === id ? { ...e, value } : e));
		setEntries(next);
		persist(next);
	};

	const handleAdd = () => {
		setEntries((prev) => [...prev, { id: crypto.randomUUID(), key: '', value: '' }]);
	};

	const handleRemove = (id: string) => {
		const next = entries.filter((e) => e.id !== id);
		setEntries(next);
		persist(next);
	};

	if (isLoading) {
		return <div className="tagger-body--scroll tagger-body--loading">Loading…</div>;
	}

	return (
		<div className="tagger-body--scroll">
			<div className="tagger-kv--header-row">
				<span className="tagger-kv--col-label col-tag-map">Key</span>
				<span className="tagger-kv--col-label col-path">Value</span>
				<span className="tagger-kv--col-spacer" />
			</div>

			<ul className="tagger-kv--list">
				{entries.map((entry, index) => (
					<>
						{index > 0 && <li key={`sep-${entry.id}`} className="tagger-kv--row-separator" />}
						<li key={entry.id} className="tagger-kv--row">
							<input
								className="tagger-kv--input input-tag-map"
								type="text"
								placeholder="e.g. gravity"
								value={entry.key}
								onChange={(e) => handleKeyChange(entry.id, e.target.value)}
							/>
							<input
								className="tagger-kv--input input-path"
								type="text"
								placeholder="e.g. 9.8"
								value={entry.value}
								onChange={(e) => handleValueChange(entry.id, e.target.value)}
							/>
							<button
								className="tagger-kv--remove-btn"
								onClick={() => handleRemove(entry.id)}
								title="Remove entry"
							>
								<Xmark width={12} strokeWidth={2} />
							</button>
						</li>
					</>
				))}
			</ul>

			<div className="tagger-kv--add-container">
				<button className="tagger-kv--add-button" onClick={handleAdd}>
					<Plus width={14} strokeWidth={2.5} />
					<span>Add property</span>
				</button>
			</div>
		</div>
	);
}

export default TaggerGameConfigBody;
