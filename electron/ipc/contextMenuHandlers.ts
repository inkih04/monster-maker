import { ipcMain, Menu, MenuItemConstructorOptions, BrowserWindow } from 'electron';

export function setupContextMenuHandlers(): void {
	ipcMain.on('show-file-context-menu', (event, fileData) => {
		const template: MenuItemConstructorOptions[] = [
			{
				label: 'Open',
				click: () => {
					event.sender.send('file-action', 'open', fileData);
				},
			},
			{
				label: 'Rename',
				click: () => {
					event.sender.send('file-action', 'rename', fileData);
				},
			},
			{
				label: 'Copy',
				click: () => {
					event.sender.send('file-action', 'copy', fileData);
				},
			},
			{
				type: 'separator',
			},
			{
				label: 'Delete',
				click: () => {
					event.sender.send('file-action', 'delete', fileData);
				},
			},
		];

		const menu = Menu.buildFromTemplate(template);
		menu.popup({ window: BrowserWindow.fromWebContents(event.sender) ?? undefined });
	});

	ipcMain.on('show-folder-context-menu', (event, folderData: { name: string; path: string }) => {
		const template: MenuItemConstructorOptions[] = [
			{
				label: 'Create Folder',
				click: () => {
					event.sender.send('folder-action', 'create-folder', folderData);
				},
			},
			{
				type: 'separator',
			},
			{
				label: 'Delete',
				click: () => {
					event.sender.send('folder-action', 'delete-folder', folderData);
				},
			},
		];

		const menu = Menu.buildFromTemplate(template);

		menu.on('menu-will-close', () => {
			event.sender.send('folder-menu-closed', folderData);
		});

		menu.popup({ window: BrowserWindow.fromWebContents(event.sender) ?? undefined });
	});
}
