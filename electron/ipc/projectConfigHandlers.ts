import { ipcMain, dialog } from 'electron';
import { ProjectConfigManager } from '../managers/ProjectConfigManager';
import type { ProjectData } from '../../global/types/projectData';

const configManager = new ProjectConfigManager();

export function setupProjectConfigHandlers(): void {
	ipcMain.handle('config:getAll', () => {
		try {
			return configManager.loadConfig().projects;
		} catch (error) {
			console.error('Error getting projects:', error);
			return [];
		}
	});

	ipcMain.handle('config:add', async (_event, pd: ProjectData) => {
		try {
			const directoryHasBeenCreated: boolean = configManager.createProjectDirectory(pd);
			if (directoryHasBeenCreated) {
				return {
					success: true,
				};
			} else {
				return {
					success: false,
					error: String('File with that name already exists'),
				};
			}
		} catch (error) {
			return {
				success: false,
				error: String(error),
			};
		}
	});

	ipcMain.handle('config:open', async (_event, pd: ProjectData) => {
		try {
			const directoryHasBeenOpened: boolean = configManager.openProjectDirectory(pd);
			if (directoryHasBeenOpened) {
				return {
					success: true,
				};
			} else {
				return {
					success: false,
				};
			}
		} catch (error) {
			return {
				success: false,
				error: String(error),
			};
		}
	});

	ipcMain.handle('config:remove', async (_event, pd: ProjectData) => {
		try {
			configManager.removeProject(pd);

			return { success: true };
		} catch (error) {
			return {
				success: false,
				error: String(error),
			};
		}
	});

	ipcMain.handle('config:selectFolder', async () => {
		try {
			const result = await dialog.showOpenDialog({
				properties: ['openDirectory'],
				title: 'Selecciona carpeta del proyecto',
			});

			if (result.canceled || result.filePaths.length === 0) {
				return { success: false, error: 'Cancelado' };
			}

			return {
				success: true,
				path: result.filePaths[0],
				suggestedName: result.filePaths[0].split(/[/\\]/).pop() || 'Proyecto',
			};
		} catch (error) {
			return {
				success: false,
				error: String(error),
			};
		}
	});
}
