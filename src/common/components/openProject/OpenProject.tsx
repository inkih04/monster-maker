import * as Dialog from '@radix-ui/react-dialog';
import './OpenProject.css';
import { useProjectStore } from '../../../Project/ProjectConfigGState';
import { useProjectForm } from '../../customHooks/useProjectForm';
import { Folder } from 'iconoir-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ProjectData } from '../../../../global/types/projectData';

interface OpenProjectProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

function OpenProject({ open, onOpenChange }: Readonly<OpenProjectProps>) {
	const { openProject } = useProjectStore();
	const [hasError, setHasError] = useState(false);
	const [isSubmittingLocal, setIsSubmittingLocal] = useState(false);
	const { t } = useTranslation();

	const { setPath, path, tileSize, setTileSize, selectFolder, reset, isSelecting } = useProjectForm(
		{
			onSuccess: () => onOpenChange(false),
		}
	);
	const isTileSizeValid = Number(tileSize) > 0 && Number(tileSize) % 16 === 0;

	const handleClose = () => {
		reset();
		setHasError(false);
		onOpenChange(false);
	};

	const splitPathIntoDirAndName = (fullPath: string) => {
		const trimmed = fullPath.trim().replace(/[\\/]+$/u, '');
		if (trimmed === '') return { dir: '', name: '' };
		const lastSlash = Math.max(trimmed.lastIndexOf('/'), trimmed.lastIndexOf('\\'));
		if (lastSlash === -1) {
			return { dir: '', name: trimmed };
		}
		const dir = trimmed.slice(0, lastSlash);
		const name = trimmed.slice(lastSlash + 1);
		return { dir, name };
	};

	const handleSubmit = async () => {
		setHasError(false);
		if (path.trim() === '') return;
		const { dir, name } = splitPathIntoDirAndName(path);
		const projectData: ProjectData = { path: dir, name: name, defaultTilesize: tileSize };
		try {
			setIsSubmittingLocal(true);
			const result = await openProject(projectData);
			setIsSubmittingLocal(false);
			if (!result.success) {
				setHasError(true);
				return;
			}
			reset();
			onOpenChange(false);
		} catch (err) {
			setIsSubmittingLocal(false);
			setHasError(true);
			console.log(err);
		}
	};

	const isButtonDisabled =
		path.trim() === '' || isSubmittingLocal || isSelecting || !isTileSizeValid;

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
				<Dialog.Overlay className="open--overlay" onClick={handleClose} />
				<Dialog.Content className="open--wrapper" onEscapeKeyDown={handleClose}>
					<div className="open--header">
						<Dialog.Title className="open--title">{t('openProject')}</Dialog.Title>
						<Dialog.Close asChild>
							<button className="open--close" aria-label={t('close')} onClick={handleClose}>
								×
							</button>
						</Dialog.Close>
					</div>
					<div className="open--form">
						<div className="open--section">
							<label htmlFor="projectDefaultTileSize" className="opne--label">
								{t('defaultTileSize')}
							</label>
							<input
								id="projectDefaultTileSize"
								type="number"
								step="16"
								min="16"
								className={`open--input ${!isTileSizeValid || hasError ? 'open--input-invalid' : ''}`}
								value={tileSize}
								onChange={(e) => setTileSize(Number(e.target.value))}
								autoFocus
							/>
						</div>
						<div className="open--section">
							<label htmlFor="projectLocation" className="open--label">
								{t('location')}
							</label>
							<div className="open--input-group">
								<div className="open--input-wrapper">
									<input
										id="projectLocation"
										type="text"
										className={`open--input open--input-path ${hasError ? 'open--input-invalid' : ''}`}
										value={path}
										onChange={(e) => {
											setPath(e.target.value);
											if (hasError) setHasError(false);
										}}
										placeholder={t('selectFolder')}
										autoFocus
									/>
									<button type="button" className="open--input-folder" onClick={selectFolder}>
										<Folder />
									</button>
								</div>
							</div>
							<div className="emptyDiv"></div>
							{hasError && <span className="open--input-error-text">{t('invalidDirectory')}</span>}
						</div>
					</div>

					<div className="open--actions">
						<button
							className="open--btn open--btn-cancel"
							onClick={handleClose}
							disabled={isSubmittingLocal}
						>
							{t('cancel')}
						</button>
						<button
							className="open--btn open--btn-create"
							onClick={handleSubmit}
							disabled={isButtonDisabled}
						>
							{isSubmittingLocal ? t('opening') : t('openProject')}
						</button>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}

export default OpenProject;
