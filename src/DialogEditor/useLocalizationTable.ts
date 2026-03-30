import { useState, useEffect } from 'react';
import { VisibilityState } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { useLocalizationStore } from './LocalizationGState';
import { useProjectStore } from '../Project/ProjectConfigGState';
import { useEngineConfigStore } from '../Tagger/useEngineConfigStore';

export function useLocalizationTable() {
	const { t } = useTranslation();
	const pd = useProjectStore((s) => s.currentProject);
	const { tags, saveTags } = useEngineConfigStore();

	const {
		data,
		languages,
		isLoading,
		isSaving,
		loadLocalization,
		saveAll,
		updateCell,
		renameLanguage: storeRenameLanguage,
		addLanguage,
		deleteLanguage: storeDeleteLanguage,
		addRow,
		deleteRow: storeDeleteRow,
		downloadLanguage,
		importLanguage,
	} = useLocalizationStore();

	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
	const [globalFilter, setGlobalFilter] = useState<string>('');
	const [deleteLangDialogOpen, setDeleteLangDialogOpen] = useState(false);
	const [languageToDelete, setLanguageToDelete] = useState<string | null>(null);
	const [deleteRowDialogOpen, setDeleteRowDialogOpen] = useState(false);
	const [rowToDelete, setRowToDelete] = useState<{ index: number; key: string } | null>(null);

	useEffect(() => {
		if (pd) {
			void loadLocalization(pd);
		}
	}, [pd, loadLocalization]);

	const addTag = (baseName: string, tagPath: string) => {
		if (!pd) return;
		saveTags(pd, { ...tags, [baseName]: tagPath });
	};

	const removeTag = (baseName: string) => {
		if (!pd) return;
		const newTags = { ...tags };
		delete newTags[baseName];
		saveTags(pd, newTags);
	};

	const executeDeleteLanguage = async () => {
		if (!languageToDelete || !pd) return;
		await storeDeleteLanguage(languageToDelete, pd);
		removeTag(languageToDelete);
		setLanguageToDelete(null);
	};

	const executeDeleteRow = async () => {
		if (!rowToDelete || !pd) return;
		storeDeleteRow(rowToDelete.index);
		await saveAll(pd);
		setRowToDelete(null);
	};

	const handleAddWord = () => {
		const targetIndex = data.length;
		addRow();

		if (globalFilter) setGlobalFilter('');

		setTimeout(() => {
			const inputEl = document.getElementById(`cell-${targetIndex}-key`) as HTMLInputElement | null;
			if (inputEl) {
				inputEl.focus();
				inputEl.select();
			}
		}, 50);
	};

	const handleAddLanguage = () => {
		addLanguage();
	};

	const renameLanguage = (oldLang: string, newLang: string) => {
		if (!pd) return;
		void storeRenameLanguage(oldLang, newLang, pd).then(async (result) => {
			if (!result.success) {
				alert(
					t(
						'localizationTable.langExistsAlert',
						result.error ?? 'Ese código de idioma ya existe o es inválido.'
					)
				);
			} else {
				let tagPath = await window.api.pathUnion('resources', '.locals');
				tagPath = await window.api.pathUnion(tagPath, `${newLang}.local`);

				if (!oldLang.startsWith('new_')) {
					removeTag(oldLang);
				}

				addTag(newLang, tagPath);
			}
		});
	};

	return {
		pd,
		t,
		data,
		languages,
		isLoading,
		isSaving,
		columnVisibility,
		setColumnVisibility,
		globalFilter,
		setGlobalFilter,
		deleteLangDialogOpen,
		setDeleteLangDialogOpen,
		languageToDelete,
		setLanguageToDelete,
		deleteRowDialogOpen,
		setDeleteRowDialogOpen,
		rowToDelete,
		setRowToDelete,
		executeDeleteLanguage,
		executeDeleteRow,
		handleAddWord,
		handleAddLanguage,
		updateCell,
		saveAll,
		renameLanguage,
		downloadLanguage,
		importLanguage,
	};
}
