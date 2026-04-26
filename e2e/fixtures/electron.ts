/* eslint-disable no-empty-pattern */
import { test as base, ElectronApplication, Page } from '@playwright/test';
import { _electron as electron } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';
import { createRequire } from 'module'; // <-- 1. Importamos createRequire

// Reemplaza __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 2. Extraemos la ruta exacta del ejecutable de Electron instalado en node_modules
const require = createRequire(import.meta.url);
const electronPath = require('electron');

type ElectronFixtures = {
	electronApp: ElectronApplication;
	window: Page;
};

export const test = base.extend<ElectronFixtures>({
	electronApp: async ({}, use) => {
		const app = await electron.launch({
			executablePath: electronPath, // <-- 3. Le pasamos la ruta explícitamente a Playwright
			args: [path.join(__dirname, '../../dist-electron/main.js')],
		});
		await use(app);
		await app.close();
	},
	window: async ({ electronApp }, use) => {
		const page = await electronApp.firstWindow();
		await page.waitForLoadState('domcontentloaded');
		await use(page);
	},
});

export { expect } from '@playwright/test';