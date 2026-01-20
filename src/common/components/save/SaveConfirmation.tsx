import * as Dialog from '@radix-ui/react-dialog';
import { useTranslation } from 'react-i18next';
import './SaveConfirmation.css';
import { useMapStore } from '../../../Map/MapGState';
import { useProjectStore } from '../../../Project/ProjectConfigGState';

interface ConfirmDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
}

function SaveConfirmation({ open, onOpenChange, onConfirm }: Readonly<ConfirmDialogProps>) {
	const mapRelativePath = useMapStore((get) => get.mapRelativePath);
	const currentProject = useProjectStore((get) => get.currentProject);
	const contentMap = useMapStore((get) => get.exportToEngineFormat());

	const { t } = useTranslation();

	const handleConfirm = async () => {
		await save();
		onConfirm();
		onOpenChange(false);
	};

	const handleCancel = () => {
		onOpenChange(false);
	};

	const save = async () => {
		if (mapRelativePath && currentProject) {
			const result = await window.api.saveFile(mapRelativePath, contentMap, currentProject);
			console.log(result);
		} else {
			console.log('no tenia path');

			return; //ya hare algo luego
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
