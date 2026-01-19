import * as Dialog from '@radix-ui/react-dialog';
import { useTranslation } from 'react-i18next';
import './DeleteConfirmation.css';

interface ConfirmDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	itemName: string;
	onConfirm: () => void;
}

function DeleteConfirmation({ open, onOpenChange, itemName, onConfirm }: ConfirmDialogProps) {

	const { t } = useTranslation();

	const handleConfirm = () => {
		onConfirm();
		onOpenChange(false);
	};

	const handleCancel = () => {
		onOpenChange(false);
	};

	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="delete--overlay" />
				<Dialog.Content className="delete--content">
					<Dialog.Title className="delete--title">
						{t('deleteConfirmTitle')}
					</Dialog.Title>
					<Dialog.Description className="delete--description">
						{t('deleteConfirmMessage').replace('{{item}}', itemName)}
					</Dialog.Description>
					<div className="delete--buttons">
						<button className="delete--btn delete--btn-cancel" onClick={handleCancel}>
							{t('deleteCancel')}
						</button>
						<button className="delete--btn delete--btn-confirm" onClick={handleConfirm}>
							{t('deleteConfirm')}
						</button>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}

export default DeleteConfirmation;