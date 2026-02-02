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

	ipcMain.handle('save-image', async (event, base64Data) => {
		const { filePath } = await dialog.showSaveDialog({
			title: 'Export Map to PNG',
			defaultPath: 'map.png',
			filters: [{ name: 'Images', extensions: ['png'] }],
		});

		if (filePath) {
			const base64Image = base64Data.split(';base64,').pop();
			fs.writeFileSync(filePath, base64Image, { encoding: 'base64' });
			return { success: true, path: filePath };
		}
		return { success: false };
	});
}
