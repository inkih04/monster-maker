import * as fs from 'fs';
import * as path from 'path';
import { ProjectData } from '../../global/types/projectData';
import FolderNode from '../../global/types/folderNode';

export class FileSystemService {
	public getProjectPath(pd: ProjectData): string {
		return path.join(pd.path, pd.name);
	}

	public exists(filePath: string): boolean {
		return fs.existsSync(filePath);
	}

	public isDirectory(filePath: string): boolean {
		try {
			return fs.statSync(filePath).isDirectory();
		} catch {
			return false;
		}
	}

	public validateRequiredDirectories(basePath: string, requiredPaths: string[]): boolean {
		return requiredPaths.every((relativePath) => {
			const fullPath = path.join(basePath, relativePath);
			return this.exists(fullPath) && this.isDirectory(fullPath);
		});
	}

	public getRequiredProjectPaths(): string[] {
		return [
			'resources',
			'resources/fonts',
			'resources/maps',
			'resources/maps/data',
			'resources/maps/tileset',
			'resources/sprites',
			'resources/scripts',
		];
	}

	public deleteFile(filePath: string): boolean {
		try {
			if (!this.exists(filePath)) {
				console.error(`Cannot delete file: ${filePath} does not exist`);
				return false;
			}

			if (this.isDirectory(filePath)) {
				console.error(`Cannot delete: ${filePath} is a directory, not a file`);
				return false;
			}

			fs.unlinkSync(filePath);
			return true;
		} catch (error) {
			console.error(`Error deleting file ${filePath}:`, error);
			return false;
		}
	}

	public createDirectories(basePath: string, directories: string[]): void {
		directories.forEach((dir) => {
			const fullPath = path.join(basePath, dir);
			fs.mkdirSync(fullPath, { recursive: true });
		});
	}

	public readDirectoryStructure(basePath: string): FolderNode[] {
		if (!this.exists(basePath)) {
			return [];
		}

		const buildStructure = (dirPath: string, base: string): FolderNode[] => {
			const items = fs.readdirSync(dirPath);
			const folders: FolderNode[] = [];

			for (const item of items) {
				const fullPath = path.join(dirPath, item);

				if (this.isDirectory(fullPath)) {
					const relativePath = path.relative(base, fullPath);
					const children = buildStructure(fullPath, base);

					folders.push({
						name: item,
						path: relativePath,
						...(children.length > 0 && { children }),
					});
				}
			}

			return folders;
		};

		return buildStructure(basePath, basePath);
	}

	public readFilesInFolder(folderPath: string): string[] {
		if (!this.exists(folderPath)) {
			return [];
		}

		const files: string[] = [];

		const collectFiles = (dirPath: string) => {
			const items = fs.readdirSync(dirPath);

			for (const item of items) {
				const fullPath = path.join(dirPath, item);
				const stats = fs.statSync(fullPath);

				if (stats.isFile()) {
					const relativePath = path.relative(folderPath, fullPath);
					files.push(relativePath);
				} else if (stats.isDirectory()) {
					collectFiles(fullPath);
				}
			}
		};

		collectFiles(folderPath);
		return files;
	}

	public readJSON<T>(filePath: string): T | null {
		try {
			if (!this.exists(filePath)) {
				return null;
			}
			const data = fs.readFileSync(filePath, 'utf-8');
			return JSON.parse(data);
		} catch (error) {
			console.error(`Error reading JSON file ${filePath}:`, error);
			return null;
		}
	}

	public writeJSON<T>(filePath: string, data: T): boolean {
		try {
			fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
			return true;
		} catch (error) {
			console.error(`Error writing JSON file ${filePath}:`, error);
			return false;
		}
	}
}
