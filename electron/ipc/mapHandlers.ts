import { ipcMain, dialog } from 'electron';
import fs from 'fs';

export function setupMapHandlers(): void {
	ipcMain.handle('export-map', async (_event, mapData: string) => {
		try {
			const result = await dialog.showSaveDialog({
				title: 'Export Map',
				defaultPath: 'map.json',
				filters: [
					{ name: 'JSON Files', extensions: ['json'] },
					{ name: 'All Files', extensions: ['*'] },
				],
			});

			if (result.canceled || !result.filePath) {
				return { success: false, error: 'Cancelado' };
			}

			fs.writeFileSync(result.filePath, mapData, 'utf-8');

			return {
				success: true,
				path: result.filePath,
			};
		} catch (error) {
			return {
				success: false,
				error: String(error),
			};
		}
	});
}
