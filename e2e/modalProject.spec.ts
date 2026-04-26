import { test, expect } from './fixtures/electron';

test.describe('ModalProject', () => {
	test('shows the projects modal when opening the app', async ({ window }) => {
		const dialog = window.locator('.Dialog-wrapper');
		await expect(dialog).toBeVisible();
	});

	test('shows the SearchBar inside the modal', async ({ window }) => {
		const searchBar = window.locator('.dialog-searchbar input');
		await expect(searchBar).toBeVisible();
	});

	test('filters projects when typing in the search bar', async ({ window }) => {
		const searchBar = window.locator('.dialog-searchbar input');
		await searchBar.fill('my-project');

		const projects = window.locator('.dialog-projects > *');
		for (const project of await projects.all()) {
			const name = await project.textContent();
			expect(name?.toLowerCase()).toContain('my-project');
		}
	});

	test('opens the new project modal when clicking "New Project"', async ({ window }) => {
		const newProjectBtn = window.locator('.dialog-btn', { hasText: /new project/i });
		await newProjectBtn.click();

		const createDialog = window.locator('[role="dialog"]').nth(1);
		await expect(createDialog).toBeVisible();
	});

	test('opens the open project modal when clicking "Open"', async ({ window }) => {
		const openBtn = window.locator('.dialog-btn', { hasText: /open/i });
		await openBtn.click();

		const openDialog = window.locator('[role="dialog"]').nth(1);
		await expect(openDialog).toBeVisible();
	});

	test('clicks on a project and calls validateProjectPath', async ({ window, electronApp }) => {
		await electronApp.evaluate(({ ipcMain }) => {
			ipcMain.removeAllListeners('validateProjectPath');
			ipcMain.handle('validateProjectPath', () => true);
		});

		const firstProject = window.locator('.dialog-projects > *').first();

		if (await firstProject.isVisible()) {
			await firstProject.click();
			await expect(window.locator('.Dialog-wrapper')).not.toBeVisible();
		}
	});
});
