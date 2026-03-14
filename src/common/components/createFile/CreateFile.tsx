import * as Dialog from '@radix-ui/react-dialog';
import './CreateFile.css';
import { useProjectForm } from '../../customHooks/useProjectForm';
import { Folder } from 'iconoir-react';
import checkInvalidChars from '../../../../global/checks/checkInvalidChars';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFileToBeCreatedStore } from '../../globalStores/useFileToBeCreated';

function CreateFile() {
	const [hasError, setHasError] = useState(false);
	const { t } = useTranslation();

	const open = useFileToBeCreatedStore((state) => state.isOpen);
	const setOpen = useFileToBeCreatedStore((state) => state.setOpen);
	const onOpenChange = useFileToBeCreatedStore((state) => state.onOpenChange);
	const createFile = useFileToBeCreatedStore((state) => state.createFile);
	const resetStore = useFileToBeCreatedStore((state) => state.reset);

	const {
		name,
		setPath,
		setName,
		path,
		selectFolder,
		reset,
		isDisabled,
		isSubmitting,
		isSelecting,
	} = useProjectForm({
		onSuccess: () => {
			setOpen(false);
			onOpenChange(false);
		},
	});

	const handleClose = () => {
		reset();
		setHasError(false);
		resetStore();
		setOpen(false);
		onOpenChange(false);
	};

	const handleSubmit = async () => {
		setHasError(false);

		if (name.trim() === '' || path.trim() === '') return;

		const result = await createFile(name.trim(), path);

		if (result.success) {
			reset();
			setOpen(false);
			onOpenChange(false);
		} else {
			setHasError(true);
		}
	};

	const isNameValid = name.trim() !== '' && checkInvalidChars(name);
	const isButtonDisabled = isDisabled || !isNameValid || isSubmitting || isSelecting;

	return (
		<Dialog.Root
			open={open}
			onOpenChange={(isOpen) => {
				if (!isOpen) {
					handleClose();
				} else {
					setOpen(isOpen);
				}
			}}
		>
			<Dialog.Portal>
				<Dialog.Overlay className="saveFile--overlay" onClick={handleClose} />
				<Dialog.Content className="saveFile--wrapper" onEscapeKeyDown={handleClose}>
					<div className="saveFile--header">
						<Dialog.Title className="saveFile--title">{t('saveFileTitle')}</Dialog.Title>
						<Dialog.Close asChild>
							<button className="saveFile--close" aria-label={t('close')} onClick={handleClose}>
								x
							</button>
						</Dialog.Close>
					</div>
					<div className="saveFile--form">
						<div className="saveFile--section">
							<label htmlFor="fileName" className="saveFile--label">
								{t('fileName')}
							</label>
							<input
								id="fileName"
								type="text"
								className={`saveFile--input ${!isNameValid || hasError ? 'saveFile--input-invalid' : ''}`}
								value={name}
								onChange={(e) => {
									setName(e.target.value);
									if (hasError) setHasError(false);
								}}
								autoFocus
							/>
							{hasError && (
								<span className="saveFile--input-error-text">{t('fileAlreadyExists')}</span>
							)}
						</div>
						<div className="saveFile--section">
							<label htmlFor="fileLocation" className="saveFile--label">
								{t('location')}
							</label>
							<div className="saveFile--input-group">
								<div className="saveFile--input-wrapper">
									<input
										id="fileLocation"
										type="text"
										className="saveFile--input saveFile--input-path"
										value={path}
										onChange={(e) => setPath(e.target.value)}
										placeholder={t('selectFolder')}
									/>
									<button type="button" className="saveFile--input-folder" onClick={selectFolder}>
										<Folder />
									</button>
								</div>
							</div>
						</div>
					</div>

					<div className="saveFile--actions">
						<button
							className="saveFile--btn saveFile--btn-cancel"
							onClick={handleClose}
							disabled={isSubmitting}
						>
							{t('cancel')}
						</button>
						<button
							className="saveFile--btn saveFile--btn-create"
							onClick={handleSubmit}
							disabled={isButtonDisabled}
						>
							{isSubmitting ? t('saving') : t('save')}
						</button>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}

export default CreateFile;
