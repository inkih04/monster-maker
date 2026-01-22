import * as Dialog from '@radix-ui/react-dialog';
import './Create.css';
import { useProjectStore } from '../../../Project/ProjectConfigGState';
import { useProjectForm } from '../../customHooks/useProjectForm';
import { Folder } from 'iconoir-react';
import checkInvalidChars from '../../../../global/checks/checkInvalidChars';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface CreateProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

function Create({ open, onOpenChange }: Readonly<CreateProps>) {
	const { addProject } = useProjectStore();
	const [hasError, setHasError] = useState(false);
	const { t } = useTranslation();

	const { name, setPath, setName, path, selectFolder, submit, reset, isDisabled, isSubmitting } =
		useProjectForm({
			onSuccess: () => onOpenChange(false),
		});

	const handleClose = () => {
		reset();
		setHasError(false);
		onOpenChange(false);
	};

	const handleSubmit = async () => {
		setHasError(false);

		const result = await submit(addProject);

		if (!result.success && result.error === 'File with that name already exists') {
			setHasError(true);
		}
	};

	const isNameValid = name.trim() === '' || checkInvalidChars(name);
	const isButtonDisabled = isDisabled || !isNameValid;

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
				<Dialog.Overlay className="create--overlay" onClick={handleClose} />
				<Dialog.Content className="create--wrapper" onEscapeKeyDown={handleClose}>
					<div className="create--header">
						<Dialog.Title className="create--title">{t('newProject')}</Dialog.Title>

						<Dialog.Close asChild>
							<button className="create--close" aria-label="Close" onClick={handleClose}>
								×
							</button>
						</Dialog.Close>
					</div>
					<div className="create--form">
						<div className="create--section">
							<label htmlFor="projectName" className="create--label">
								{t('projectName')}
							</label>
							<input
								id="projectName"
								type="text"
								className={`create--input ${!isNameValid || hasError ? 'create--input-invalid' : ''}`}
								value={name}
								onChange={(e) => setName(e.target.value)}
								autoFocus
							/>
						</div>
						<div className="create--section">
							<label htmlFor="projectLocation" className="create--label">
								{t('location')}
							</label>
							<div className="create--input-group">
								<div className="create--input-wrapper">
									<input
										id="projectLocation"
										type="text"
										className="create--input create--input-path"
										value={path}
										onChange={(e) => setPath(e.target.value)}
										placeholder={t('selectFolder')}
									/>

									<button type="button" className="create--input-folder" onClick={selectFolder}>
										<Folder></Folder>
									</button>
								</div>
							</div>
						</div>
					</div>

					<div className="create--actions">
						<button
							className="create--btn create--btn-cancel"
							onClick={handleClose}
							disabled={isSubmitting}
						>
							{t('cancel')}
						</button>
						<button
							className="create--btn create--btn-create"
							onClick={handleSubmit}
							disabled={isButtonDisabled}
						>
							{isSubmitting ? t('creating') : t('newProject')}
						</button>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}

export default Create;
