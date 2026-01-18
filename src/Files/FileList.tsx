import './FileList.css';

import { getFileIcon } from '../common/utils/filesUtils';
import { useFileWatcher } from '../common/customHooks/useFileWatcher';

export default function FileList() {
	const { files, isLoading } = useFileWatcher();

	if (isLoading) {
		return null;
	}

	return (
		<div className="files--container">
			<div className="files--grid">
				{files.map((file, index) => (
					<div key={`${file.name}-${index}`} className="files--item">
						<div className="files--icon">{getFileIcon(file.type)}</div>
						<span className="files--name">{file.name}</span>
					</div>
				))}
			</div>
		</div>
	);
}