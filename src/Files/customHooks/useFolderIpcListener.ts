import { useEffect } from 'react';
import { useFolderEventsStore } from '../FolderEventsGState';


export function useFolderIpcListener() {
	const dispatchFolderAction = useFolderEventsStore((state) => state.dispatchFolderAction);
	const dispatchFolderMenuClosed = useFolderEventsStore((state) => state.dispatchFolderMenuClosed);

	useEffect(() => {
		const unsubscribeAction = window.api.onFolderAction((action, folderData) => {
			dispatchFolderAction(action, folderData.path);
		});

		const unsubscribeClosed = window.api.onFolderMenuClosed((folderData) => {
			dispatchFolderMenuClosed(folderData.path);
		});

		return () => {
			unsubscribeAction();
			unsubscribeClosed();
		};
	}, [dispatchFolderAction, dispatchFolderMenuClosed]);
}
