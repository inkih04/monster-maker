import * as path from 'path';
import { ProjectsConfig } from '../../global/types/projectConfig';
import { ProjectData } from '../../global/types/projectData';
import { ProjectFile } from '../../global/types/projectFile';
import { log } from 'console';
import FolderNode from '../../global/types/folderNode';
import { BrowserWindow } from 'electron';
import { FileSystemWatcher } from './FileSystemWatcher';
import { FileSystemService } from './FileSystemService';
import { spawn } from 'child_process';

export class ProjectConfigManager {
	private readonly configPath: string;
	private config: ProjectsConfig;
	private readonly fileSystemWatcher: FileSystemWatcher;
	private readonly fileSystemService: FileSystemService;
	private currentWatchedFolder: { pd: ProjectData; folder: FolderNode } | null = null;

	constructor() {
		this.configPath = this.getConfigPath();
		this.fileSystemWatcher = new FileSystemWatcher();
		this.fileSystemService = new FileSystemService();
		this.config = this.loadConfig();
	}

	public deleteFile(fileRelativePath: string, folderPath: string, pd: ProjectData): boolean {
		try {
			const projectPath = this.fileSystemService.getProjectPath(pd);
			const completePath = path.join(projectPath, path.join(folderPath, fileRelativePath));

			log(completePath);

			if (!this.fileSystemService.exists(completePath)) {
				console.log(`File does not exist: ${completePath}`);
				return false;
			}

			this.fileSystemService.deleteFile(completePath);

			if (this.currentWatchedFolder) {
				const folderPath = path.dirname(fileRelativePath);
				const watchedFolderPath = this.currentWatchedFolder.folder.path;

				if (folderPath === watchedFolderPath) {
					const files = this.getFilesInFolder(
						this.currentWatchedFolder.pd,
						this.currentWatchedFolder.folder
					);
					this.fileSystemWatcher.notifyMainWindow('files-changed', files);
				}
			}

			return true;
		} catch (error) {
			console.log(`Error deleting file: ${error}`);
			return false;
		}
	}

	public saveFile(
		fileRelativePath: string,
		content: string,
		pd: ProjectData
	): { success: boolean; error?: string } {
		try {
			const projectPath = this.fileSystemService.getProjectPath(pd);
			const completePath = path.join(projectPath, fileRelativePath);

			const dirPath = path.dirname(completePath);
			if (!this.fileSystemService.exists(dirPath)) {
				return { success: false, error: `Directory does not exist: ${dirPath}` };
			}

			if (this.fileSystemService.saveFile(completePath, content)) {
				return { success: true };
			} else {
				return { success: false };
			}
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}
	public saveFileCompletePath(
		name: string,
		completePath: string,
		content: string
	): { success: boolean; error?: string } {
		try {
			const dirPath = path.dirname(completePath);
			if (!this.fileSystemService.exists(dirPath)) {
				return { success: false, error: `Directory does not exist: ${dirPath}` };
			}
			completePath = path.join(completePath, name);

			if (this.fileSystemService.saveFile(completePath, content)) {
				log('completado');
				return { success: true };
			} else {
				log('fallo2');
				return { success: false };
			}
		} catch (error) {
			log('catch');
			return { success: false, error: String(error) };
		}
	}

	public pathUnion(path1: string, path2: string): string {
		return path.join(path1, path2);
	}

	public getFile(
		fileRelativePath: string,
		folderPath: string,
		pd: ProjectData
	): { success: boolean; content?: ProjectFile; error?: string } {
		try {
			const projectPath = this.fileSystemService.getProjectPath(pd);
			const completePath = path.join(projectPath, path.join(folderPath, fileRelativePath));

			if (!this.fileSystemService.exists(completePath)) {
				console.log(`File does not exist: ${completePath}`);
				return { success: false, error: 'File does not exist' };
			}

			if (this.fileSystemService.isDirectory(completePath)) {
				console.log(`Path is a directory, not a file: ${completePath}`);
				return { success: false, error: 'Path is a directory' };
			}

			const cont = this.fileSystemService.readFile(completePath);
			const relativeP = path.join(folderPath, fileRelativePath);

			return { success: true, content: { relativePath: relativeP, content: cont } };
		} catch (error) {
			console.log(`Error getting file: ${error}`);
			return { success: false, error: String(error) };
		}
	}

	public renameFile(
		oldFileRelativePath: string,
		newFileName: string,
		folderPath: string,
		pd: ProjectData
	): boolean {
		try {
			const projectPath = this.fileSystemService.getProjectPath(pd);
			const oldCompletePath = path.join(projectPath, path.join(folderPath, oldFileRelativePath));

			if (!this.fileSystemService.exists(oldCompletePath)) {
				console.log(`File does not exist: ${oldCompletePath}`);
				return false;
			}

			const directory = path.dirname(oldCompletePath);
			const extension = path.extname(oldCompletePath);
			const newCompletePath = path.join(directory, newFileName + extension);

			if (this.fileSystemService.exists(newCompletePath)) {
				console.log(`File already exists: ${newCompletePath}`);
				return false;
			}

			this.fileSystemService.renameFile(oldCompletePath, newCompletePath);

			if (this.currentWatchedFolder) {
				const folderPath = path.dirname(oldFileRelativePath);
				const watchedFolderPath = this.currentWatchedFolder.folder.path;

				if (folderPath === watchedFolderPath) {
					const files = this.getFilesInFolder(
						this.currentWatchedFolder.pd,
						this.currentWatchedFolder.folder
					);
					this.fileSystemWatcher.notifyMainWindow('files-changed', files);
				}
			}

			return true;
		} catch (error) {
			console.log(`Error deleting file: ${error}`);
			return false;
		}
	}

	public setMainWindow(window: BrowserWindow): void {
		this.fileSystemWatcher.setMainWindow(window);
	}

	private getConfigPath(): string {
		if (process.env.NODE_ENV === 'development') {
			return path.join(process.cwd(), 'src', 'assets', 'projects.json');
		}
		return path.join(process.resourcesPath, 'assets', 'projects.json');
	}

	public getEngineSourcePath(): string {
		if (process.env.NODE_ENV === 'development') {
			return path.join(process.cwd(), 'engine', 'exe');
		}
		return path.join(process.resourcesPath, 'engine', 'exe');
	}

	public getShaderSourcePath(): string {
		if (process.env.NODE_ENV === 'development') {
			return path.join(process.cwd(), 'engine', 'shaders');
		}
		return path.join(process.resourcesPath, 'engine', 'shaders');
	}

	public validateProjectPath(pd: ProjectData): boolean {
		try {
			const projectPath = this.fileSystemService.getProjectPath(pd);

			if (!this.fileSystemService.exists(projectPath)) {
				console.log(`Project invalid: ${pd.name} - Path does not exist: ${projectPath}`);
				return false;
			}

			if (!this.fileSystemService.isDirectory(projectPath)) {
				console.log(`Project invalid: ${pd.name} - Path is not a directory: ${projectPath}`);
				return false;
			}

			const requiredPaths = this.fileSystemService.getRequiredProjectPaths();
			const isValid = this.fileSystemService.validateRequiredDirectories(
				projectPath,
				requiredPaths
			);

			if (!isValid) {
				console.log(`Project invalid: ${pd.name} - Missing required directories`);
				return false;
			}

			return true;
		} catch (error) {
			console.log(`Project invalid: ${pd.name} - Error validating: ${error}`);
			return false;
		}
	}

	public loadConfig(): ProjectsConfig {
		try {
			log('loading Configuration');
			const config = this.fileSystemService.readJSON<ProjectsConfig>(this.configPath);

			if (config) {
				const validProjects = config.projects.filter((project) =>
					this.validateProjectPath(project)
				);

				if (validProjects.length !== config.projects.length) {
					const validatedConfig: ProjectsConfig = { projects: validProjects };
					this.config = validatedConfig;
					this.saveProjectConfiguration();
					console.log(
						`Cleaned up ${config.projects.length - validProjects.length} invalid projects`
					);
					return validatedConfig;
				}

				return config;
			} else {
				const defaultConfig: ProjectsConfig = { projects: [] };
				this.fileSystemService.writeJSON(this.configPath, defaultConfig);
				return defaultConfig;
			}
		} catch (error) {
			console.log(error + ' (fail while loading projects)');
		}

		return { projects: [] };
	}

	public saveProjectConfiguration(): void {
		this.fileSystemService.writeJSON(this.configPath, this.config);
	}

	public removeProject(pd: ProjectData): void {
		this.config.projects = this.config.projects.filter((p) => p.path !== pd.path);
		this.saveProjectConfiguration();
	}

	private addProjectData(pd: ProjectData): void {
		try {
			const projectPath = this.fileSystemService.getProjectPath(pd);
			const existingIndex = this.config.projects.findIndex(
				(p) => this.fileSystemService.getProjectPath(p) === projectPath
			);

			if (existingIndex === -1) {
				pd.color = this.getRandomColor();
				this.config.projects.push(pd);
				this.saveProjectConfiguration();
			}
		} catch (error) {
			log(error + ' (fail while adding the project)');
		}
	}

	public openProjectDirectory(pd: ProjectData): boolean {
		try {
			if (!this.validateProjectPath(pd)) {
				return false;
			}

			this.addProjectData(pd);
			return true;
		} catch (error) {
			log(error + ' (fail while opening project directory)');
			return false;
		}
	}

	public createProjectDirectory(pd: ProjectData): boolean {
		try {
			const projectPath = this.fileSystemService.getProjectPath(pd);

			if (this.fileSystemService.exists(projectPath)) {
				return false;
			}

			const requiredPaths = this.fileSystemService.getRequiredProjectPaths();
			this.fileSystemService.createDirectories(projectPath, requiredPaths);

			const enginePath = this.getEngineSourcePath();
			this.fileSystemService.copyDirectoryContent(enginePath, projectPath);

			const shadersPath = this.getShaderSourcePath();
			this.fileSystemService.copyDirectoryContent(
				shadersPath,
				path.join(projectPath, path.join('resources', 'shaders'))
			);

			this.addProjectData(pd);
			return true;
		} catch (error) {
			log(error + ' (fail while creating project directory)');
			return false;
		}
	}

	private getRandomColor(): string {
		const colors = ['#45B7D1', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B195'];
		return colors[Math.floor(Math.random() * colors.length)];
	}

	public getDirectoryStructure(pd: ProjectData): FolderNode[] {
		try {
			const projectPath = this.fileSystemService.getProjectPath(pd);
			return this.fileSystemService.readDirectoryStructure(projectPath);
		} catch (error) {
			log(error + ' (fail while reading directory structure)');
			return [];
		}
	}

	public getFilesInFolder(pd: ProjectData, folder: FolderNode): string[] {
		try {
			const projectPath = this.fileSystemService.getProjectPath(pd);
			const fullFolderPath = path.join(projectPath, folder.path);
			return this.fileSystemService.readFilesInFolder(fullFolderPath);
		} catch (error) {
			log(error + ' (fail while reading files in folder)');
			return [];
		}
	}

	public startWatching(pd: ProjectData): void {
		const projectPath = this.fileSystemService.getProjectPath(pd);

		if (!this.fileSystemService.exists(projectPath)) {
			return;
		}

		this.fileSystemWatcher.watchDirectory('directory-structure', projectPath, () => {
			const structure = this.getDirectoryStructure(pd);
			this.fileSystemWatcher.notifyMainWindow('directory-structure-changed', structure);
		});
	}

	public stopWatching(): void {
		this.fileSystemWatcher.stopWatcher('directory-structure');
	}

	public startWatchingFiles(pd: ProjectData, folder: FolderNode): void {
		const projectPath = this.fileSystemService.getProjectPath(pd);
		const fullFolderPath = path.join(projectPath, folder.path);

		if (!this.fileSystemService.exists(fullFolderPath)) {
			return;
		}

		this.currentWatchedFolder = { pd, folder };

		this.fileSystemWatcher.watchFiles('files-in-folder', fullFolderPath, () => {
			const files = this.getFilesInFolder(pd, folder);
			this.fileSystemWatcher.notifyMainWindow('files-changed', files);
		});
	}

	public stopWatchingFiles(): void {
		this.fileSystemWatcher.stopWatcher('files-in-folder');
		this.currentWatchedFolder = null;
	}

	public runEngine(pd: ProjectData): { success: boolean; error?: string } {
		try {
			const projectPath = this.fileSystemService.getProjectPath(pd);

			if (!this.fileSystemService.exists(projectPath)) {
				return { success: false, error: 'Engine directory does not exist' };
			}

			const platform = process.platform;
			let executableName: string;

			switch (platform) {
				case 'darwin':
					executableName = 'MonsterMakerEngineMac';
					break;
				case 'linux':
					executableName = 'MonsterMakerEngineLinux';
					break;
				default:
					return { success: false, error: `Unsupported platform: ${platform}` };
			}

			const executablePath = path.join(projectPath, executableName);

			if (!this.fileSystemService.exists(executablePath)) {
				return { success: false, error: `Executable not found: ${executablePath}` };
			}

			const child = spawn(executablePath, [], {
				cwd: projectPath,
				detached: true,
				stdio: 'ignore',
			});

			child.unref();

			console.log(`Engine started: ${executablePath}`);
			return { success: true };
		} catch (error) {
			console.error(`Error running engine: ${error}`);
			return { success: false, error: String(error) };
		}
	}
}
