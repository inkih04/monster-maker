import { app, BrowserWindow, Menu, MenuItemConstructorOptions, net, protocol } from 'electron';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import { setupMapHandlers } from './ipc/mapHandlers';
import { setupProjectConfigHandlers } from './ipc/projectConfigHandlers';
import defaultMenu from 'electron-default-menu';
import { setupContextMenuHandlers } from './ipc/contextMenuHandlers';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, '..');

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron');
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist');

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
	? path.join(process.env.APP_ROOT, 'public')
	: RENDERER_DIST;

let win: BrowserWindow | null = null;

function createWindow() {
	win = new BrowserWindow({
		icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
		show: false,
		minHeight: 800,
		minWidth: 1400,
		webPreferences: {
			preload: path.join(__dirname, 'preload.mjs'),
			contextIsolation: true,
			nodeIntegration: false,
			sandbox: true,
			webSecurity: true,
		},
	});

	win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
		const csp = VITE_DEV_SERVER_URL
			? [
					"default-src 'self' http://localhost:5173 ws://localhost:5173;",
					"script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:5173;",
					"style-src 'self' 'unsafe-inline' http://localhost:5173;",
					"img-src 'self' data: blob: project-file:;",
					"font-src 'self' data:;",
				].join(' ')
			: [
					"default-src 'self';",
					"script-src 'self';",
					"style-src 'self' 'unsafe-inline';",
					"img-src 'self' data: project-file:;",
					"font-src 'self';",
				].join(' ');

		callback({
			responseHeaders: {
				...details.responseHeaders,
				'Content-Security-Policy': [csp],
			},
		});
	});

	win.webContents.on('did-finish-load', () => {
		win?.webContents.send('main-process-message', new Date().toLocaleString());
	});

	win.once('ready-to-show', () => {
		if (VITE_DEV_SERVER_URL) {
			win?.showInactive();
		} else {
			win?.show();
		}
	});

	if (VITE_DEV_SERVER_URL) {
		win.loadURL(VITE_DEV_SERVER_URL);
	} else {
		win.loadFile(path.join(RENDERER_DIST, 'index.html'));
	}

	setupProjectConfigHandlers(win);
	setupMapHandlers();
}

app.whenReady().then(() => {
	protocol.handle('project-file', (request) => {
		const url = request.url.replace('project-file://', '');
		const decodedPath = decodeURIComponent(url);
		return net.fetch(pathToFileURL(decodedPath).toString());
	});

	createWindow();
	setupContextMenuHandlers();
	const menu = defaultMenu(app, require('electron').shell);

	const editMenuIndex = menu.findIndex((item) => item.label === 'Edit');
	if (editMenuIndex !== -1 && menu[editMenuIndex].submenu) {
		const editSubmenu = menu[editMenuIndex].submenu as MenuItemConstructorOptions[];
		editSubmenu.push(
			{ type: 'separator' },
			{
				label: 'Export Current Map to JSON',
				accelerator: 'CmdOrCtrl+E',
				click: () => {
					win?.webContents.send('export-map-request');
				},
			}
		);

		editSubmenu.push({
			label: 'Export Current Map to PNG',
			click: () => {
				win?.webContents.send('export-map-PNG-request');
			},
		});
	}

	menu.splice(-1, 0, {
		label: 'Language',
		submenu: [
			{
				label: 'English',
				type: 'radio',
				click: () => win?.webContents.send('change-language', 'en'),
			},
			{
				label: 'Español',
				type: 'radio',
				click: () => win?.webContents.send('change-language', 'es'),
			},
		],
	});

	menu.splice(1, 0, {
		label: 'File',
		submenu: [
			{
				label: 'Create New File',
				type: 'submenu',
				submenu: [
					{
						label: 'Map',
						type: 'normal',
						click: () => win?.webContents.send('create-new-file', 'map'),
					},
					{
						label: 'Prefab',
						type: 'normal',
						click: () => win?.webContents.send('create-new-file', 'prefab'),
					},
					{
						label: 'Script',
						type: 'normal',
						click: () => win?.webContents.send('create-new-file', 'script'),
					},
				],
			},
			{
				label: 'Add New File',
				type: 'normal',
				click: () => win?.webContents.send('add-new-file'),
			},
			{
				label: 'Save',
				type: 'normal',
				accelerator: 'CmdOrCtrl+S',
				click: () => win?.webContents.send('save-file'),
			},
		],
	});

	Menu.setApplicationMenu(Menu.buildFromTemplate(menu));
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
	if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
