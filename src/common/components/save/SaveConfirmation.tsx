import * as Dialog from '@radix-ui/react-dialog';
import { useTranslation } from 'react-i18next';
import './SaveConfirmation.css';
import { useMapStore } from '../../../Map/MapGState';
import { useProjectStore } from '../../../Project/ProjectConfigGState';
import { useFileToBeCreatedStore } from '../../globalStores/useFileToBeCreated';
import { useEngineStore } from '../../../ToolBar/EngineGState';
import { useCodeEditorStore } from '../../../CodeEditor/CodeEditorGState';

interface ConfirmDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
}

function SaveConfirmation({ open, onOpenChange, onConfirm }: Readonly<ConfirmDialogProps>) {
	const mapRelativePath = useMapStore((get) => get.mapRelativePath);
	const currentProject = useProjectStore((get) => get.currentProject);
	const contentMap = useMapStore((get) => get.exportToEngineFormat());
	const editorMode = useEngineStore((get) => get.editorMode);
	const codeEditorMode = useEngineStore((get) => get.codeEditorMode);

	const filePath = useCodeEditorStore((get) => get.openFile?.relativePath);
	const contentCode = useCodeEditorStore((get) => get.openFile?.content);
	const markSaved = useCodeEditorStore((get) => get.markSaved);

	const openUiFile = useCodeEditorStore((get) => get.openUiFile);
	const markUiSaved = useCodeEditorStore((get) => get.markUiSaved);

	const openFileCreation = useFileToBeCreatedStore((get) => get.setOpen);
	const setFileExtension = useFileToBeCreatedStore((get) => get.setExtension);
	const setContent = useFileToBeCreatedStore((get) => get.setContent);
	const setOnOpenChange = useFileToBeCreatedStore((get) => get.setOnOpenChange);
	const reset = useFileToBeCreatedStore((get) => get.reset);

	const { t } = useTranslation();

	const handleConfirm = async () => {
		await save();
	};

	const handleCancel = () => {
		onOpenChange(false);
		onConfirm();
	};

	const save = async () => {
		if (editorMode === 'map') {
			if (mapRelativePath && currentProject) {
				const result = await window.api.saveFile(mapRelativePath, contentMap, currentProject);
				console.log(result);
				onConfirm();
				onOpenChange(false);
			} else {
				reset();
				setFileExtension('.map');
				setContent(contentMap);
				setOnOpenChange((isOpen: boolean) => {
					if (!isOpen) {
						onConfirm();
					}
				});
				onOpenChange(false);
				openFileCreation(true);
			}
		} else if (editorMode === 'code') {
			if (codeEditorMode === 'single') {
				if (!filePath || !currentProject || !contentCode) return;
				const result = await window.api.saveFile(filePath, contentCode, currentProject);
				markSaved();
				console.log(result);
				onConfirm();
				onOpenChange(false);
			} else if (codeEditorMode === 'duo') {
				if (!openUiFile) return;

				const [htmlResult, cssResult] = await Promise.all([
					window.api.saveFileCompletePath('', openUiFile.htmlPath, openUiFile.htmlContent),
					window.api.saveFileCompletePath('', openUiFile.cssPath, openUiFile.cssContent),
				]);

				console.log('html save:', htmlResult, '| css save:', cssResult);
				markUiSaved();
				onConfirm();
				onOpenChange(false);
			}
		}
	};

	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="save--overlay" />
				<Dialog.Content className="save--content">
					<Dialog.Title className="save--title">{t('saveConfirmTitle')}</Dialog.Title>
					<Dialog.Description className="save--description">
						{t('saveConfirmMessage')}
					</Dialog.Description>
					<div className="save--buttons">
						<button className="save--btn save--btn-cancel" onClick={handleCancel}>
							{t('saveCancel')}
						</button>
						<button className="save--btn save--btn-confirm" onClick={handleConfirm}>
							{t('saveConfirm')}
						</button>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}

export default SaveConfirmation;
