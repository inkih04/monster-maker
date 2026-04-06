import { ipcMain, dialog } from 'electron';
import { ProjectConfigManager } from '../managers/ProjectConfigManager';
import type { ProjectData } from '../../global/types/projectData';
import type { BrowserWindow } from 'electron';
import FolderNode from '../../global/types/folderNode';
import { GameConfig } from '../../global/types/engineConfig';
import { TileSetConfig } from '../../global/types/tileSetConfig';

const configManager = new ProjectConfigManager();

export function setupProjectConfigHandlers(mainWindow: BrowserWindow): void {
	configManager.setMainWindow(mainWindow);

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
				return { success: true };
			} else {
				return { success: false, error: String('File with that name already exists') };
			}
		} catch (error) {
			return { success: false, error: String(error) };
		}
	});

	ipcMain.handle('config:open', async (_event, pd: ProjectData, defaultTileSize: number) => {
		try {
			const directoryHasBeenOpened: boolean = configManager.openProjectDirectory(pd);
			if (directoryHasBeenOpened) {
				return { success: true };
			} else {
				return { success: false };
			}
		} catch (error) {
			return { success: false, error: String(error) };
		}
	});

	ipcMain.handle('config:remove', async (_event, pd: ProjectData) => {
		try {
			configManager.removeProject(pd);
			return { success: true };
		} catch (error) {
			return { success: false, error: String(error) };
		}
	});

	ipcMain.handle(
		'config:deleteFile',
		async (_event, fileRelativePath: string, folderPath: string, pd: ProjectData) => {
			try {
				const success = configManager.deleteFile(fileRelativePath, folderPath, pd);
				if (success) {
					return { success: true };
				} else {
					return { success: false, error: 'File does not exist or could not be deleted' };
				}
			} catch (error) {
				return { success: false, error: String(error) };
			}
		}
	);

	ipcMain.handle(
		'config:deleteFileFullPath',
		async (_event, completePath: string, pd: ProjectData) => {
			try {
				const success = configManager.deleteFileFullPath(completePath, pd);
				if (success) {
					return { success: true };
				} else {
					return { success: false, error: 'File does not exist or could not be deleted' };
				}
			} catch (error) {
				return { success: false, error: String(error) };
			}
		}
	);

	ipcMain.handle('config:deleteFolder', async (_event, folderNode: FolderNode, pd: ProjectData) => {
		try {
			const result = configManager.deleteFolder(folderNode, pd);
			return result;
		} catch (error) {
			return { success: false, error: String(error) };
		}
	});

	ipcMain.handle('config:toRelativePath', (_event, absolutePath: string) => {
		return configManager.toRelativePath(absolutePath);
	});

	ipcMain.handle('config:pathUnion', async (_event, path1: string, path2: string) => {
		return configManager.pathUnion(path1, path2);
	});

	ipcMain.handle(
		'config:selectFile',
		async (_event, defaultPath?: string, filters?: { name: string; extensions: string[] }[]) => {
			try {
				const result = await dialog.showOpenDialog({
					properties: ['openFile'],
					title: 'Select a file',
					defaultPath: defaultPath ?? '',
					filters: filters ?? [
						{ name: 'Lua Scripts', extensions: ['lua'] },
						{ name: 'All Files', extensions: ['*'] },
					],
				});

				if (result.canceled || result.filePaths.length === 0) {
					return { success: false, error: 'Canceled' };
				}

				return { success: true, path: result.filePaths[0] };
			} catch (error) {
				return { success: false, error: String(error) };
			}
		}
	);

	ipcMain.handle('config:selectFolder', async (_event, defaultPath?: string) => {
		try {
			const result = await dialog.showOpenDialog({
				properties: ['openDirectory'],
				title: 'Select a folder',
				defaultPath: defaultPath ?? '',
			});

			if (result.canceled || result.filePaths.length === 0) {
				return { success: false, error: 'Canceled' };
			}

			return {
				success: true,
				path: result.filePaths[0],
				suggestedName: result.filePaths[0].split(/[/\\]/).pop() || 'Proyecto',
			};
		} catch (error) {
			return { success: false, error: String(error) };
		}
	});

	ipcMain.handle('config:getDirectoryStructure', async (_event, pd: ProjectData) => {
		try {
			const structure = configManager.getDirectoryStructure(pd);
			return { success: true, structure };
		} catch (error) {
			return { success: false, error: String(error), structure: [] };
		}
	});

	ipcMain.handle('config:startWatching', async (_event, pd: ProjectData) => {
		try {
			configManager.startWatching(pd);
			return { success: true };
		} catch (error) {
			return { success: false, error: String(error) };
		}
	});

	ipcMain.handle('config:stopWatching', async () => {
		try {
			configManager.stopWatching();
			return { success: true };
		} catch (error) {
			return { success: false, error: String(error) };
		}
	});

	ipcMain.handle('validate-project-path', async (event, projectData: ProjectData) => {
		return configManager.validateProjectPath(projectData);
	});

	ipcMain.handle('config:getFilesInFolder', async (_event, pd: ProjectData, folder: FolderNode) => {
		try {
			const files = configManager.getFilesInFolder(pd, folder);
			return { success: true, files };
		} catch (error) {
			return { success: false, error: String(error), files: [] };
		}
	});

	ipcMain.handle(
		'config:startWatchingFiles',
		async (_event, pd: ProjectData, folder: FolderNode) => {
			try {
				configManager.startWatchingFiles(pd, folder);
				return { success: true };
			} catch (error) {
				return { success: false, error: String(error) };
			}
		}
	);

	ipcMain.handle('config:stopWatchingFiles', async () => {
		try {
			configManager.stopWatchingFiles();
			return { success: true };
		} catch (error) {
			return { success: false, error: String(error) };
		}
	});

	ipcMain.handle(
		'config:renameFile',
		async (
			_event,
			oldFileRelativePath: string,
			newFileName: string,
			folderPath: string,
			pd: ProjectData
		) => {
			try {
				const success = configManager.renameFile(oldFileRelativePath, newFileName, folderPath, pd);
				if (success) {
					return { success: true };
				} else {
					return { success: false, error: 'File does not exist or could not be renamed' };
				}
			} catch (error) {
				return { success: false, error: String(error) };
			}
		}
	);

	ipcMain.handle(
		'config:getFile',
		async (_event, fileRelativePath: string, folderPath: string, pd: ProjectData) => {
			try {
				const result = configManager.getFile(fileRelativePath, folderPath, pd);
				return result;
			} catch (error) {
				return { success: false, error: String(error) };
			}
		}
	);

	ipcMain.handle('config:getFileFullPath', async (_event, completePath: string) => {
		try {
			const result = configManager.getFileFullPath(completePath);
			return result;
		} catch (error) {
			return { success: false, error: String(error) };
		}
	});

	ipcMain.handle(
		'config:saveFile',
		async (_event, fileRelativePath: string, content: string, pd: ProjectData) => {
			try {
				const result = configManager.saveFile(fileRelativePath, content, pd);
				if (result.success) {
					return { success: true };
				} else {
					return { success: false, error: result.error };
				}
			} catch (error) {
				return { success: false, error: String(error) };
			}
		}
	);

	ipcMain.handle(
		'config:saveFileCompletePath',
		async (_event, name: string, completePath: string, content: string) => {
			try {
				const result = configManager.saveFileCompletePath(name, completePath, content);
				if (result.success) {
					return { success: true };
				} else {
					return { success: false, error: result.error };
				}
			} catch (error) {
				return { success: false, error: String(error) };
			}
		}
	);

	ipcMain.handle(
		'config:createFolder',
		async (_event, folderNode: FolderNode, newFolderName: string, pd: ProjectData) => {
			try {
				const result = configManager.createFolder(folderNode, newFolderName, pd);
				return result;
			} catch (error) {
				return { success: false, error: String(error) };
			}
		}
	);

	ipcMain.handle('config:runEngine', async (_event, pd: ProjectData, mapPath?: string) => {
		try {
			const result = configManager.runEngine(pd, mapPath);
			return result;
		} catch (error) {
			return { success: false, error: String(error) };
		}
	});

	ipcMain.handle('config:stopEngine', async () => {
		try {
			const result = configManager.stopEngine();
			return result;
		} catch (error) {
			return { success: false, error: String(error) };
		}
	});

	ipcMain.handle('config:getEngineConfig', async (_event, pd: ProjectData) => {
		try {
			return configManager.getEngineConfig(pd);
		} catch (error) {
			return { success: false, error: String(error) };
		}
	});

	ipcMain.handle(
		'config:updateShaders',
		async (_event, pd: ProjectData, shaders: Record<string, number>) => {
			try {
				return configManager.updateShaders(pd, shaders);
			} catch (error) {
				return { success: false, error: String(error) };
			}
		}
	);

	ipcMain.handle(
		'config:updateTags',
		async (_event, pd: ProjectData, tags: Record<string, string>) => {
			try {
				return configManager.updateTags(pd, tags);
			} catch (error) {
				return { success: false, error: String(error) };
			}
		}
	);

	ipcMain.handle(
		'config:updateGameConfig',
		async (_event, pd: ProjectData, gameConfig: GameConfig) => {
			try {
				return configManager.updateGameConfig(pd, gameConfig);
			} catch (error) {
				return { success: false, error: String(error) };
			}
		}
	);

	ipcMain.handle(
		'config:splitTileset',
		async (
			_event,
			imagePath: string,
			configPath: string,
			existingConfig: TileSetConfig,
			maxGpuSize: number
		) => {
			try {
				return configManager.splitTileset(imagePath, configPath, existingConfig, maxGpuSize);
			} catch (error) {
				return { success: false, error: String(error) };
			}
		}
	);

	ipcMain.handle(
		'config:saveLocalFile',
		async (_event, defaultFileName: string, content: string) => {
			try {
				const result = await dialog.showSaveDialog({
					title: 'Guardar archivo de idioma',
					defaultPath: defaultFileName,
					filters: [{ name: 'Local Files', extensions: ['local', 'json'] }],
				});
				if (result.canceled || !result.filePath) {
					return { success: false, error: 'Canceled' };
				}
				const fs = await import('fs');
				fs.writeFileSync(result.filePath, content, 'utf-8');
				return { success: true };
			} catch (error) {
				return { success: false, error: String(error) };
			}
		}
	);

	ipcMain.handle('config:importLocalFile', async () => {
		try {
			const result = await dialog.showOpenDialog({
				title: 'Importar archivo de idioma',
				properties: ['openFile'],
				filters: [{ name: 'Local Files', extensions: ['local', 'json'] }],
			});
			if (result.canceled || result.filePaths.length === 0) {
				return { success: false, error: 'Canceled' };
			}
			const fs = await import('fs');
			const content = fs.readFileSync(result.filePaths[0], 'utf-8');
			return { success: true, content };
		} catch (error) {
			return { success: false, error: String(error) };
		}
	});
}
