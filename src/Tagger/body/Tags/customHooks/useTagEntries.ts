import React, { useEffect, useRef, useState } from 'react';
import { useProjectStore } from '../../../../Project/ProjectConfigGState';
import { useFolderStore } from '../../../../common/globalStores/useFolderStore';
import { useEngineConfigStore } from '../../../useEngineConfigStore';


type TagEntry = {
	id: string;
	tag: string;
	path: string;
};

function tagsToEntries(tags: Record<string, string>): TagEntry[] {
	const entries = Object.entries(tags).map(([tag, path]) => ({
		id: crypto.randomUUID(),
		tag,
		path,
	}));
	return entries.length > 0 ? entries : [{ id: crypto.randomUUID(), tag: '', path: '' }];
}

function entriesToTags(entries: TagEntry[]): Record<string, string> {
	const result: Record<string, string> = {};
	for (const entry of entries) {
		if (entry.tag.trim() !== '') {
			result[entry.tag.trim()] = entry.path;
		}
	}
	return result;
}

export function useTagEntries() {
	const currentProject = useProjectStore((s) => s.currentProject);
	const { tags, isLoading, loadEngineConfig, saveTags } = useEngineConfigStore();
	const selectedFolder = useFolderStore((state) => state.selectedFolder);
	const [entries, setEntries] = useState<TagEntry[]>(() => tagsToEntries(tags));
	const [dragOverId, setDragOverId] = useState<string | null>(null);
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
		setEntries(tagsToEntries(tags));
	}, [tags]);

	const persist = (nextEntries: TagEntry[]) => {
		if (!currentProject) return;
		skipNextSync.current = true;
		saveTags(currentProject, entriesToTags(nextEntries));
	};

	const handleTagChange = (id: string, value: string) => {
		const next = entries.map((e) => (e.id === id ? { ...e, tag: value } : e));
		setEntries(next);
		persist(next);
	};

	const handlePathChange = (id: string, value: string) => {
		const next = entries.map((e) => (e.id === id ? { ...e, path: value } : e));
		setEntries(next);
		persist(next);
	};

	const handleAdd = () => {
		setEntries((prev) => [...prev, { id: crypto.randomUUID(), tag: '', path: '' }]);
	};

	const handleRemove = (id: string) => {
		const next = entries.filter((e) => e.id !== id);
		setEntries(next);
		persist(next);
	};

	const handleDragOver = (e: React.DragEvent, id: string) => {
		e.preventDefault();
		e.stopPropagation();
		const isFile = e.dataTransfer.types.some((t) => t.startsWith('file-type/'));
		if (!isFile) return;
		setDragOverId(id);
	};

	const handleDragLeave = () => setDragOverId(null);

	const handleDrop = async (e: React.DragEvent, id: string) => {
		e.preventDefault();
		e.stopPropagation();
		setDragOverId(null);

		const fileData = e.dataTransfer.getData('application/file-item');
		if (!fileData || !selectedFolder?.path) return;

		const file = JSON.parse(fileData);
		const finalPath = await window.api.pathUnion(selectedFolder.path, file.path);
		const next = entries.map((entry) => (entry.id === id ? { ...entry, path: finalPath } : entry));
		setEntries(next);
		persist(next);
	};

	return {
		entries,
		isLoading,
		dragOverId,
		handleTagChange,
		handlePathChange,
		handleAdd,
		handleRemove,
		handleDragOver,
		handleDragLeave,
		handleDrop,
	};
}
