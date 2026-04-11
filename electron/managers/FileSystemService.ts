import * as fs from 'fs';
import * as path from 'path';
import { ProjectData } from '../../global/types/projectData';
import * as zlib from 'zlib';
import FolderNode from '../../global/types/folderNode';
import { log } from 'console';

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

	public renameFile(oldPath: string, newPath: string): boolean {
		try {
			if (!this.exists(oldPath)) {
				console.error(`Cannot rename file: ${oldPath} does not exist`);
				return false;
			}

			if (this.exists(newPath)) {
				console.error(`Cannot rename file: ${newPath} already exists`);
				return false;
			}

			if (this.isDirectory(oldPath)) {
				console.error(`Cannot rename: ${oldPath} is a directory, not a file`);
				return false;
			}

			fs.renameSync(oldPath, newPath);
			return true;
		} catch (error) {
			console.error(`Error renaming file from ${oldPath} to ${newPath}:`, error);
			return false;
		}
	}

	public getRequiredProjectPaths(): string[] {
		const base = 'resources';

		return [
			base,
			path.join(base, 'ui'),
			path.join(base, 'data'),
			path.join(base, 'fonts'),
			path.join(base, 'dialogues'),
			path.join(base, '.locals'),
			path.join(base, 'shaders'),
			path.join(base, 'maps'),
			path.join(base, 'maps', 'data'),
			path.join(base, 'maps', 'tilesets'),
			path.join(base, 'sprites'),
			path.join(base, 'scripts'),
			path.join(base, 'music'),
		];
	}

	public readFile(filePath: string): string {
		return fs.readFileSync(filePath, 'utf-8');
	}

	public saveFile(filePath: string, content: string): boolean {
		try {
			if (this.isDirectory(filePath)) {
				return false;
			}
			const parentDir = path.dirname(filePath);
			if (!this.exists(parentDir)) {
				fs.mkdirSync(parentDir, { recursive: true });
			}

			fs.writeFileSync(filePath, content, 'utf-8');

			return true;
		} catch (error) {
			log(error);
			return false;
		}
	}

	public isCompressed(filePath: string): boolean {
		try {
			const buf = Buffer.alloc(2);
			const fd = fs.openSync(filePath, 'r');
			fs.readSync(fd, buf, 0, 2, 0);
			fs.closeSync(fd);
			return buf[0] === 0x78;
		} catch (error) {
			console.error('Error comprobando compresión en:', filePath, error);
			return false;
		}
	}

	public findFilesByExtension(basePath: string, ext: string): string[] {
		const results: string[] = [];

		const walk = (dir: string) => {
			const items = fs.readdirSync(dir);
			for (const item of items) {
				const fullPath = path.join(dir, item);
				if (this.isDirectory(fullPath)) {
					walk(fullPath);
				} else if (path.extname(item).toLowerCase() === ext) {
					results.push(fullPath);
				}
			}
		};

		if (this.exists(basePath)) walk(basePath);
		return results;
	}

	public saveCompressedFile(filePath: string, content: string): boolean {
		try {
			if (this.isDirectory(filePath)) return false;

			const parentDir = path.dirname(filePath);
			if (!this.exists(parentDir)) {
				fs.mkdirSync(parentDir, { recursive: true });
			}

			const compressed = zlib.deflateSync(Buffer.from(content, 'utf-8'));
			fs.writeFileSync(filePath, compressed);
			return true;
		} catch (error) {
			log(error);
			return false;
		}
	}

	public readCompressedFile(filePath: string): string {
		const raw = fs.readFileSync(filePath);
		const isCompressed = raw.length >= 2 && raw[0] === 0x78;
		if (isCompressed) {
			return zlib.inflateSync(raw).toString('utf-8');
		}
		return raw.toString('utf-8');
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

	public deleteFolder(folderPath: string): { success: boolean; error?: string } {
		try {
			if (!this.exists(folderPath)) {
				return { success: false, error: 'Folder does not exist' };
			}

			if (!this.isDirectory(folderPath)) {
				return { success: false, error: 'Path is not a directory' };
			}

			fs.rmSync(folderPath, { recursive: true, force: true });
			return { success: true };
		} catch (error) {
			console.error(`Error deleting folder ${folderPath}:`, error);
			return { success: false, error: String(error) };
		}
	}

	public createFolder(folderPath: string): { success: boolean; error?: string } {
		try {
			if (this.exists(folderPath)) {
				return { success: false, error: 'A folder with that name already exists' };
			}
			fs.mkdirSync(folderPath, { recursive: true });
			return { success: true };
		} catch (error) {
			console.error(`Error creating folder ${folderPath}:`, error);
			return { success: false, error: String(error) };
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

				if (item === 'exe' && dirPath === basePath) {
					continue;
				}

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
				if (item.startsWith('.')) continue;
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

	public copyFile(srcPath: string, destPath: string): boolean {
		try {
			fs.copyFileSync(srcPath, destPath);
			return true;
		} catch (error) {
			console.error(`Error copying file from ${srcPath} to ${destPath}:`, error);
			return false;
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

	public copyDirectoryContent(srcDir: string, destDir: string): boolean {
		try {
			if (!this.exists(srcDir)) {
				console.error(`Source directory does not exist: ${srcDir}`);
				return false;
			}

			if (!this.exists(destDir)) {
				fs.mkdirSync(destDir, { recursive: true });
			}

			const items = fs.readdirSync(srcDir);

			for (const item of items) {
				const srcPath = path.join(srcDir, item);
				const destPath = path.join(destDir, item);
				const stats = fs.statSync(srcPath);

				if (stats.isFile()) {
					fs.copyFileSync(srcPath, destPath);
					fs.chmodSync(destPath, 0o755);
				}
			}
			return true;
		} catch (error) {
			console.error(`Error copying directory content:`, error);
			return false;
		}
	}
}
