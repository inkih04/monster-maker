import { useEffect, useRef, useState } from 'react';
import { useProjectStore } from '../../../Project/ProjectConfigGState';
import { useEngineConfigStore } from '../../useEngineConfigStore';
import { ShaderEntry, entriesToShaders, shadersToEntries } from './shaderEntryUtils';

export function useShaderEntries() {
	const currentProject = useProjectStore((s) => s.currentProject);
	const { shaders, isLoading, loadEngineConfig, saveShaders } = useEngineConfigStore();
	const [entries, setEntries] = useState<ShaderEntry[]>(() => shadersToEntries(shaders));
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
		setEntries(shadersToEntries(shaders));
	}, [shaders]);

	const persist = (nextEntries: ShaderEntry[]) => {
		if (!currentProject) return;
		skipNextSync.current = true;
		saveShaders(currentProject, entriesToShaders(nextEntries));
	};

	const handleTagChange = (id: string, value: string) => {
		const next = entries.map((e) => (e.id === id ? { ...e, tag: value } : e));
		setEntries(next);
		persist(next);
	};

	const handleModeChange = (id: string, value: string) => {
		const parsed: number | '' = value === '' ? '' : parseInt(value, 10);
		if (value !== '' && isNaN(parsed as number)) return;
		const next = entries.map((e) => (e.id === id ? { ...e, mode: parsed } : e));
		setEntries(next);
		persist(next);
	};

	const handleAdd = () => {
		setEntries((prev) => [...prev, { id: crypto.randomUUID(), tag: '', mode: '' as const }]);
	};

	const handleRemove = (id: string) => {
		const next = entries.filter((e) => e.id !== id);
		setEntries(next);
		persist(next);
	};

	return {
		entries,
		isLoading,
		handleTagChange,
		handleModeChange,
		handleAdd,
		handleRemove,
	};
}
