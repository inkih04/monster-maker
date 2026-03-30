import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
	useReactTable,
	getCoreRowModel,
	getFilteredRowModel,
	flexRender,
	ColumnDef,
	RowData,
	CellContext,
} from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { EyeClosed, Plus, EditPencil, Search, Trash, Copy, Download, Upload } from 'iconoir-react';

import './LocalizationTable.css';
import DeleteConfirmation from '../common/components/delete/DeleteConfirmation';
import { TranslationRow } from './LocalizationGState';
import { useLocalizationTable } from './useLocalizationTable';
import { useEngineStore } from '../ToolBar/EngineGState';

declare module '@tanstack/react-table' {
	interface TableMeta<TData extends RowData> {
		updateData: (rowIndex: number, columnId: string, value: string) => void;
		renameLanguage: (oldLang: string, newLang: string) => void;
		confirmDeleteLanguage: (lang: string) => void;
		confirmDeleteRow: (rowIndex: number, key: string) => void;
		downloadLanguage: (lang: string) => void;
		importLanguage: (lang: string) => void;
	}
}

const AutoResizeTextarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => {
	const ref = useRef<HTMLTextAreaElement>(null);

	const resize = () => {
		const el = ref.current;
		if (!el) return;
		el.style.height = 'auto';
		el.style.height = `${el.scrollHeight}px`;
	};

	useEffect(() => {
		resize();
	}, [props.value]);

	return <textarea {...props} ref={ref} rows={1} onInput={resize} />;
};

const EditableCell = (props: CellContext<TranslationRow, unknown>) => {
	const {
		getValue,
		row: { index },
		column: { id },
		table,
	} = props;
	const { t } = useTranslation();
	const initialValue = (getValue() as string) || '';
	const [value, setValue] = useState<string>(initialValue);

	useEffect(() => {
		setValue(initialValue);
	}, [initialValue]);

	const onBlur = () => {
		if (value !== initialValue) {
			table.options.meta?.updateData(index, id, value);
		}
	};

	if (id === 'key') {
		return (
			<div className="edtable--key-cell-container">
				<AutoResizeTextarea
					id={`cell-${index}-key`}
					className="edtable--table-input edtable--is-key"
					value={value}
					onChange={(e) => setValue(e.target.value)}
					onBlur={onBlur}
					placeholder={t('localizationTable.keyPlaceholder', 'Escribe una clave...')}
				/>
				<button
					className="edtable--icon-btn edtable--delete-row-btn"
					onClick={() => navigator.clipboard.writeText(value)}
					title={t('localizationTable.copyKeyTooltip', 'Copiar clave')}
				>
					<Copy width={16} height={16} />
				</button>
				<button
					className="edtable--icon-btn edtable--icon-btn-danger edtable--delete-row-btn"
					onClick={() => table.options.meta?.confirmDeleteRow(index, value)}
					title={t('localizationTable.deleteRowTooltip', 'Eliminar clave')}
				>
					<Trash width={16} height={16} />
				</button>
			</div>
		);
	}

	return (
		<AutoResizeTextarea
			id={`cell-${index}-${id}`}
			className="edtable--table-input"
			value={value}
			onChange={(e) => setValue(e.target.value)}
			onBlur={onBlur}
			placeholder={t('localizationTable.translationPlaceholder', { lang: id.toUpperCase() })}
			disabled={id.startsWith('new_')}
		/>
	);
};

interface EditableHeaderProps {
	initialLang: string;
	onRename: (oldLang: string, newLang: string) => void;
}

const EditableHeader: React.FC<EditableHeaderProps> = ({ initialLang, onRename }) => {
	const { t } = useTranslation();
	const isNew = initialLang.startsWith('new_');
	const [isEditing, setIsEditing] = useState<boolean>(isNew);
	const [value, setValue] = useState<string>(isNew ? '' : initialLang);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (isEditing && inputRef.current) {
			inputRef.current.focus();
		}
	}, [isEditing]);

	const handleBlur = () => {
		const trimmedValue = value.trim().toLowerCase();

		if (trimmedValue && trimmedValue !== initialLang) {
			onRename(initialLang, trimmedValue);
			setIsEditing(false);
		} else if (!trimmedValue) {
			if (!isNew) {
				setValue(initialLang);
				setIsEditing(false);
			} else {
				inputRef.current?.focus();
			}
		} else {
			setIsEditing(false);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			handleBlur();
		}
	};

	if (isEditing) {
		return (
			<input
				ref={inputRef}
				className="edtable--header-input"
				value={value}
				onChange={(e) => setValue(e.target.value)}
				onBlur={handleBlur}
				onKeyDown={handleKeyDown}
				placeholder={t('localizationTable.langPlaceholder', 'Ej: fr, it...')}
				maxLength={5}
			/>
		);
	}

	return (
		<div
			className="edtable--header-text"
			onClick={() => setIsEditing(true)}
			title={t('localizationTable.editHeaderHint', 'Haz clic para editar el idioma')}
		>
			<span>{value.toUpperCase()}</span>
			<EditPencil width={14} height={14} className="edtable--edit-icon" />
		</div>
	);
};

export const LocalizationTable: React.FC = () => {
	const isTranslateMode = useEngineStore((state) => state.translate);
	const {
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
	} = useLocalizationTable();

	const columns = useMemo<ColumnDef<TranslationRow>[]>(() => {
		const baseColumns: ColumnDef<TranslationRow>[] = [
			{
				accessorKey: 'key',
				header: () => (
					<div className="edtable--header-content">
						<span>{t('localizationTable.keyColumn', 'Clave (Key)')}</span>
					</div>
				),
				cell: (props) => <EditableCell {...props} />,
				size: 250,
				enableHiding: false,
			},
		];

		const langColumns: ColumnDef<TranslationRow>[] = languages.map((lang) => ({
			accessorKey: lang,
			header: ({ table, column }) => (
				<div className="edtable--header-content">
					<EditableHeader
						initialLang={lang}
						onRename={(oldL, newL) => table.options.meta?.renameLanguage(oldL, newL)}
					/>
					<div className="edtable--header-actions">
						{isTranslateMode && (
							<>
								<button
									className="edtable--icon-btn"
									onClick={() => table.options.meta?.downloadLanguage(lang)}
									title={t('localizationTable.downloadTooltip', 'Descargar JSON')}
								>
									<Download width={16} height={16} />
								</button>
								<button
									className="edtable--icon-btn"
									onClick={() => table.options.meta?.importLanguage(lang)}
									title={t('localizationTable.importTooltip', 'Importar JSON')}
								>
									<Upload width={16} height={16} />
								</button>
							</>
						)}
						<button
							className="edtable--icon-btn"
							onClick={() => column.toggleVisibility(false)}
							title={t('localizationTable.hideColumnTooltip', 'Ocultar columna')}
						>
							<EyeClosed width={16} height={16} />
						</button>
						{isTranslateMode && (
							<button
								className="edtable--icon-btn edtable--icon-btn-danger"
								onClick={() => table.options.meta?.confirmDeleteLanguage(lang)}
								title={t('localizationTable.deleteColumnTooltip', 'Eliminar idioma')}
							>
								<Trash width={16} height={16} />
							</button>
						)}
					</div>
				</div>
			),
			cell: (props) => <EditableCell {...props} />,
		}));

		return [...baseColumns, ...langColumns];
	}, [languages, t]);

	const table = useReactTable({
		data,
		columns,
		state: { columnVisibility, globalFilter },
		onColumnVisibilityChange: setColumnVisibility,
		onGlobalFilterChange: setGlobalFilter,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		meta: {
			updateData: (rowIndex: number, columnId: string, value: string) => {
				updateCell(rowIndex, columnId, value);
				if (pd) void saveAll(pd);
			},
			renameLanguage,
			confirmDeleteLanguage: (lang: string) => {
				setLanguageToDelete(lang);
				setDeleteLangDialogOpen(true);
			},
			confirmDeleteRow: (rowIndex: number, key: string) => {
				setRowToDelete({ index: rowIndex, key });
				setDeleteRowDialogOpen(true);
			},
			downloadLanguage: (lang: string) => void downloadLanguage(lang),
			importLanguage: (lang: string) => {
				if (pd) void importLanguage(lang, pd);
			},
		},
	});

	const hiddenColumns = table.getAllLeafColumns().filter((col) => !col.getIsVisible());

	if (isLoading) {
		return (
			<div className="edtable--table-wrapper edtable--loading">
				<span>{t('localizationTable.loading', 'Cargando traducciones...')}</span>
			</div>
		);
	}

	return (
		<div className="edtable--table-wrapper">
			<div className="edtable--table-container">
				<table className="edtable--table">
					<thead>
						{table.getHeaderGroups().map((headerGroup) => (
							<tr key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<th
										key={header.id}
										style={{ width: header.getSize() !== 150 ? header.getSize() : 'auto' }}
									>
										{header.isPlaceholder
											? null
											: flexRender(header.column.columnDef.header, header.getContext())}
									</th>
								))}
							</tr>
						))}
					</thead>
					<tbody>
						{table.getRowModel().rows.length === 0 ? (
							<tr>
								<td colSpan={columns.length} className="edtable--empty-state">
									{t('localizationTable.noResults', 'No se encontraron resultados.')}
								</td>
							</tr>
						) : (
							table.getRowModel().rows.map((row) => (
								<tr key={row.id}>
									{row.getVisibleCells().map((cell) => (
										<td key={cell.id}>
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</td>
									))}
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			<div className="edtable--table-toolbar">
				<div className="edtable--search-group">
					<Search width={18} height={18} className="edtable--search-icon" />
					<input
						type="text"
						className="edtable--search-input"
						placeholder={t('localizationTable.searchPlaceholder', 'Buscar traducciones...')}
						value={globalFilter ?? ''}
						onChange={(e) => setGlobalFilter(e.target.value)}
					/>
				</div>

				<div className="edtable--status-indicator">
					{isSaving && t('localizationTable.saving', 'Guardando...')}
				</div>

				<div className="edtable--toolbar-actions">
					{hiddenColumns.length > 0 && (
						<div className="edtable--hidden-columns-group">
							{hiddenColumns.map((column) => (
								<button
									key={column.id}
									className="edtable--restore-col-btn"
									onClick={() => column.toggleVisibility(true)}
									title={t('localizationTable.showColumnTooltip', 'Mostrar columna')}
								>
									<Plus width={14} height={14} />
									{column.id === 'key' ? t('localizationTable.keyColumn') : column.id.toUpperCase()}
								</button>
							))}
						</div>
					)}
					{isTranslateMode && (
						<button
							className="edtable--table-btn edtable--btn-secondary"
							onClick={handleAddLanguage}
						>
							{t('localizationTable.addLanguage', '+ Añadir Idioma')}
						</button>
					)}
					<button className="edtable--table-btn" onClick={handleAddWord}>
						{t('localizationTable.addWord', '+ Añadir Palabra')}
					</button>
				</div>
			</div>

			<DeleteConfirmation
				open={deleteLangDialogOpen}
				onOpenChange={setDeleteLangDialogOpen}
				itemName={languageToDelete ? languageToDelete.toUpperCase() : ''}
				onConfirm={() => void executeDeleteLanguage()}
			/>

			<DeleteConfirmation
				open={deleteRowDialogOpen}
				onOpenChange={setDeleteRowDialogOpen}
				itemName={rowToDelete?.key || t('localizationTable.emptyKey', 'Clave vacía')}
				onConfirm={() => void executeDeleteRow()}
			/>
		</div>
	);
};
