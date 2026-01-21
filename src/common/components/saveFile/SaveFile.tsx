import * as Dialog from '@radix-ui/react-dialog';
import './SaveFile.css';
import { useProjectForm } from '../../customHooks/useProjectForm';
import { Folder } from 'iconoir-react';
import checkInvalidChars from '../../../../global/checks/checkInvalidChars';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMapStore } from '../../../Map/MapGState';

interface SaveFileProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

function SaveFile({ open, onOpenChange }: Readonly<SaveFileProps>) {
	const [hasError, setHasError] = useState(false);
	const contentMap = useMapStore((get) => get.exportToEngineFormat());
	const { t } = useTranslation();

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
		onSuccess: () => onOpenChange(false),
	});

	const handleClose = () => {
		reset();
		setHasError(false);
		onOpenChange(false);
	};

	const handleSubmit = async () => {
		setHasError(false);

		if (name.trim() === '' || path.trim() === '') return;

		console.log(path);

		const result = await window.api.saveFileCompletePath(name+".json", path, contentMap);
		if (!result.success && result.error === 'File with that name already exists') {
			console.log(result.error);
			console.log('error');

			setHasError(true);
			return;
		}
		reset();
		onOpenChange(false);
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
					onOpenChange(isOpen);
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
								×
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

export default SaveFile;
