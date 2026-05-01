import { test, expect } from './fixtures/electron';
import fs from 'fs';
import path from 'path';
import os from 'os';

test.describe('Project Flow', () => {
	let testProjectPath: string;

	test.beforeAll(() => {
		testProjectPath = fs.mkdtempSync(path.join(os.tmpdir(), 'pokemon-maker-test-'));
	});

	test.afterAll(() => {
		if (fs.existsSync(testProjectPath)) {
			fs.rmSync(testProjectPath, { recursive: true, force: true });
		}
	});

	test('creates a new project, creates a map, and cleans up', async ({ window, electronApp }) => {
		const projectName = `E2E_${Date.now()}`;
		const projectFullPath = path.join(testProjectPath, projectName);

		const dialogWrapper = window.locator('.Dialog-wrapper');
		await expect(dialogWrapper).toBeVisible();

		const newProjectBtn = window.locator('.dialog-btn', { hasText: /new project/i });
		await newProjectBtn.click();

		const createDialog = window.locator('[role="dialog"]').nth(1);
		await expect(createDialog).toBeVisible();

		await window.locator('#projectName').fill(projectName);
		await window.locator('#projectLocation').fill(testProjectPath);

		const createBtn = window.locator('.create--btn-create');
		await createBtn.click();

		await expect(createDialog).not.toBeVisible();

		const createdProject = window.locator('.dialog-projects > *', { hasText: projectName });
		await expect(createdProject).toBeVisible();
		await createdProject.click();

		await expect(dialogWrapper).not.toBeVisible();

		await expect(window.locator('.files--container')).toBeVisible();

		await electronApp.evaluate(({ BrowserWindow }) => {
			const win = BrowserWindow.getAllWindows()[0];
			win.webContents.send('create-file-inline', 'map');
		});

		const nameInput = window.locator('.files--item textarea.files--rename-input');
		await expect(nameInput).toBeVisible();
		
		const mapName = 'TestMap';
		await nameInput.fill(mapName);
		await nameInput.press('Enter');

		await expect(nameInput).not.toBeVisible();

		const newMapFile = window.locator('.files--item .files--name', { hasText: mapName });
		await expect(newMapFile).toBeVisible();

		await window.evaluate(async (data) => {
			if (window.api && window.api.removeProject) {
				await window.api.removeProject({
					name: data.name,
					path: data.path
				});
			}
		}, { path: testProjectPath, name: projectName });
	});
});
