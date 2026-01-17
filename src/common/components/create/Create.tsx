import * as Dialog from '@radix-ui/react-dialog';
import './Create.css';
import { useProjectStore } from '../../../Project/ProjectConfigGState';
import { useProjectForm } from '../../customHooks/useProjectForm';
import { Folder } from 'iconoir-react';
import checkInvalidChars from '../../../../global/checks/checkInvalidChars';
import { useState } from 'react';

interface CreateProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

function Create({ open, onOpenChange }: Readonly<CreateProps>) {
	const { addProject } = useProjectStore();
	const [hasError, setHasError] = useState(false);

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

		const result =  await submit(addProject);

		if (!result.success && result.error === 'File with that name already exists') {
			setHasError(true);
		}
	};

	const isNameValid = name.trim() === '' || checkInvalidChars(name);
	const isButtonDisabled = isDisabled || !isNameValid;

	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="create--overlay" />
				<Dialog.Content className="create--wrapper">
					<div className="create--header">
						<Dialog.Title className="create--title">New Project</Dialog.Title>

						<Dialog.Close asChild>
							<button className="create--close" aria-label="Close">
								×
							</button>
						</Dialog.Close>
					</div>
					<div className="create--form">
						<div className="create--section">
							<label htmlFor="projectName" className="create--label">
								Project Name
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
								Location
							</label>
							<div className="create--input-group">
								<div className="create--input-wrapper">
									<input
										id="projectLocation"
										type="text"
										className="create--input create--input-path"
										value={path}
										onChange={(e) => setPath(e.target.value)}
										placeholder="Select a folder..."
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
							Cancel
						</button>
						<button
							className="create--btn create--btn-create"
							onClick={handleSubmit}
							disabled={isButtonDisabled}
						>
							{isSubmitting ? 'Creating...' : 'New Project'}
						</button>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}

export default Create;
