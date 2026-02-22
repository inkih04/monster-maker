import { ipcMain, Menu, MenuItemConstructorOptions, BrowserWindow } from 'electron';
import mainI18n from '../mainI18n';

export function setupContextMenuHandlers(): void {
	ipcMain.on('show-file-context-menu', (event, fileData) => {
		const t = (key: string) => mainI18n.t(key);

		const template: MenuItemConstructorOptions[] = [
			{
				label: t('menu.contextMenu.open'),
				click: () => {
					event.sender.send('file-action', 'open', fileData);
				},
			},
			{
				label: t('menu.contextMenu.rename'),
				click: () => {
					event.sender.send('file-action', 'rename', fileData);
				},
			},
			{
				label: t('menu.contextMenu.copy'),
				click: () => {
					event.sender.send('file-action', 'copy', fileData);
				},
			},
			{
				type: 'separator',
			},
			{
				label: t('menu.contextMenu.delete'),
				click: () => {
					event.sender.send('file-action', 'delete', fileData);
				},
			},
		];

		const menu = Menu.buildFromTemplate(template);
		menu.popup({ window: BrowserWindow.fromWebContents(event.sender) ?? undefined });
	});

	ipcMain.on('show-folder-context-menu', (event, folderData: { name: string; path: string }) => {
		const t = (key: string) => mainI18n.t(key);

		const template: MenuItemConstructorOptions[] = [
			{
				label: t('menu.contextMenu.createFolder'),
				click: () => {
					event.sender.send('folder-action', 'create-folder', folderData);
				},
			},
			{
				type: 'separator',
			},
			{
				label: t('menu.contextMenu.delete'),
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
