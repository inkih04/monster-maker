import { ReloadIcon } from '@radix-ui/react-icons';
import { useCodeEditorStore } from './CodeEditorGState';
import './CodeEditorLoadingOverlay.css';

export function CodeEditorLoadingOverlay() {
	const isLoading = useCodeEditorStore((state) => state.isLoadingFile);
	if (!isLoading) return null;

	return (
		<div className="codeEditorOverlay--root" aria-busy="true">
			<div className="codeEditorOverlay--content">
				<ReloadIcon className="codeEditorOverlay--spinner" width={20} height={20} />
			</div>
		</div>
	);
}
