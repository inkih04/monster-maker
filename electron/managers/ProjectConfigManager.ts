import * as path from 'path';
import { ProjectsConfig } from '../../global/types/projectConfig';
import { ProjectData } from '../../global/types/projectData';
import { log } from 'console';
import FolderNode from '../../global/types/folderNode';
import { BrowserWindow } from 'electron';
import { FileSystemWatcher } from './FileSystemWatcher';
import { FileSystemService } from './FileSystemService';

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
			log('Deleting File');
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

	public setMainWindow(window: BrowserWindow): void {
		this.fileSystemWatcher.setMainWindow(window);
	}

	private getConfigPath(): string {
		if (process.env.NODE_ENV === 'development') {
			return path.join(process.cwd(), 'src', 'assets', 'projects.json');
		}
		return path.join(process.resourcesPath, 'assets', 'projects.json');
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
}
