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
}
