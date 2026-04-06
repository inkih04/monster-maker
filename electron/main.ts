import {
	app,
	BrowserWindow,
	Menu,
	MenuItemConstructorOptions,
	net,
	protocol,
	ipcMain,
} from 'electron';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import { setupMapHandlers } from './ipc/mapHandlers';
import { setupProjectConfigHandlers } from './ipc/projectConfigHandlers';
import defaultMenu from 'electron-default-menu';
import { setupContextMenuHandlers } from './ipc/contextMenuHandlers';
import mainI18n from './mainI18n';

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

function buildAppMenu() {
	const t = (key: string) => mainI18n.t(key);
	const menu = defaultMenu(app, require('electron').shell);

	const viewMenuIndex = menu.findIndex((item) => item.label === 'View');
	if (viewMenuIndex !== -1 && menu[viewMenuIndex].submenu) {
		menu[viewMenuIndex].label = t('menu.view');
		menu[viewMenuIndex].submenu = [
			{
				label: t('menu.showCollisions'),
				type: 'checkbox',
				checked: false,
				accelerator: 'CmdOrCtrl+K',
				click: () => {
					win?.webContents.send('toggle-collisions');
				},
			},
			{
				label: t('menu.resetLayout'),
				type: 'normal',
				accelerator: 'CmdOrCtrl+r',
				click: () => {
					win?.webContents.send('reset-layout');
				},
			},
			{ type: 'separator' },
			{
				label: 'Toggle Developer Tools',
				type: 'normal',
				accelerator: 'CmdOrCtrl+Shift+I',
				click: () => {
					win?.webContents.toggleDevTools();
				},
			},
		] as MenuItemConstructorOptions[];
	}

	menu.splice(-1, 0, {
		label: t('menu.language'),
		submenu: [
			{
				label: t('menu.english'),
				type: 'radio',
				checked: mainI18n.language === 'en',
				click: () => {
					win?.webContents.send('change-language', 'en');
					mainI18n.changeLanguage('en').then(() => {
						Menu.setApplicationMenu(Menu.buildFromTemplate(buildAppMenu()));
					});
				},
			},
			{
				label: t('menu.spanish'),
				type: 'radio',
				checked: mainI18n.language === 'es',
				click: () => {
					win?.webContents.send('change-language', 'es');
					mainI18n.changeLanguage('es').then(() => {
						Menu.setApplicationMenu(Menu.buildFromTemplate(buildAppMenu()));
					});
				},
			},
		],
	});

	menu.splice(0, 0, {
		label: t('menu.file'),
		submenu: [
			{
				label: t('menu.closeProject'),
				type: 'normal',
				click: () => win?.webContents.send('close-project'),
			},
			{ type: 'separator' },
			{
				label: t('menu.createNewFile'),
				type: 'submenu',
				submenu: [
					{
						label: t('menu.map'),
						type: 'normal',
						click: () => win?.webContents.send('create-new-file', 'map'),
					},
					{
						label: t('menu.prefab'),
						type: 'normal',
						click: () => win?.webContents.send('create-new-file', 'prefab'),
					},
					{
						label: t('menu.script'),
						type: 'normal',
						click: () => win?.webContents.send('create-new-file', 'script'),
					},
					{
						label: t('menu.dialog'),
						type: 'normal',
						click: () => win?.webContents.send('create-new-file', 'dialog'),
					},
				],
			},
			{
				label: t('menu.addNewFile'),
				type: 'normal',
				click: () => win?.webContents.send('add-new-file'),
			},
			{
				label: t('menu.save'),
				type: 'normal',
				accelerator: 'CmdOrCtrl+S',
				click: () => win?.webContents.send('save-file'),
			},
			{ type: 'separator' },
			{
				label: t('menu.exportMapJSON'),
				accelerator: 'CmdOrCtrl+E',
				click: () => {
					win?.webContents.send('export-map-request');
				},
			},
			{
				label: t('menu.exportMapPNG'),
				click: () => {
					win?.webContents.send('export-map-PNG-request');
				},
			},
		],
	});

	return menu as MenuItemConstructorOptions[];
}

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
					"font-src 'self' data: http://localhost:5173;",
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

	ipcMain.on('language-changed', (_event, lng: string) => {
		mainI18n.changeLanguage(lng).then(() => {
			Menu.setApplicationMenu(Menu.buildFromTemplate(buildAppMenu()));
		});
	});

	Menu.setApplicationMenu(Menu.buildFromTemplate(buildAppMenu()));
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
	if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
