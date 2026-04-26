import * as path from 'path';
import { ProjectsConfig } from '../../global/types/projectConfig';
import { ProjectData } from '../../global/types/projectData';
import { ProjectFile } from '../../global/types/projectFile';
import { log } from 'console';
import FolderNode from '../../global/types/folderNode';
import { BrowserWindow, app } from 'electron';
import { FileSystemWatcher } from './FileSystemWatcher';
import { FileSystemService } from './FileSystemService';
import { spawn } from 'child_process';
import { EngineLog, LogLevel } from '../../global/types/engineLog';
import { EngineConfig, DEFAULT_ENGINE_CONFIG, GameConfig } from '../../global/types/engineConfig';
import { TileSetConfig } from '../../global/types/tileSetConfig';
import { AtlasService } from './atlasService';

const ENGINE_CONFIG_FILENAME = '.engineConfig.json';

export class ProjectConfigManager {
	private readonly configPath: string;
	private config: ProjectsConfig;
	private readonly fileSystemWatcher: FileSystemWatcher;
	private readonly fileSystemService: FileSystemService;
	private currentWatchedFolder: { pd: ProjectData; folder: FolderNode } | null = null;
	private engineProcess: ReturnType<typeof spawn> | null = null;
	private readonly atlasService: AtlasService = new AtlasService();

	constructor() {
		this.configPath = this.getConfigPath();
		this.fileSystemWatcher = new FileSystemWatcher();
		this.fileSystemService = new FileSystemService();
		this.config = this.loadConfig();
	}

	private getEngineConfigPath(pd: ProjectData): string {
		return path.join(this.fileSystemService.getProjectPath(pd), ENGINE_CONFIG_FILENAME);
	}

	public ensureEngineConfig(pd: ProjectData): void {
		const cfgPath = this.getEngineConfigPath(pd);
		if (!this.fileSystemService.exists(cfgPath)) {
			this.fileSystemService.writeJSON<EngineConfig>(cfgPath, DEFAULT_ENGINE_CONFIG);
			log(`Created default ${ENGINE_CONFIG_FILENAME} for project "${pd.name}"`);
		}
	}

	public getEngineConfig(pd: ProjectData): {
		success: boolean;
		config?: EngineConfig;
		error?: string;
	} {
		try {
			const cfgPath = this.getEngineConfigPath(pd);
			const cfg = this.fileSystemService.readJSON<EngineConfig>(cfgPath);
			if (cfg) {
				return { success: true, config: cfg };
			}
			return { success: true, config: { ...DEFAULT_ENGINE_CONFIG } };
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}

	public updateShaders(
		pd: ProjectData,
		shaders: Record<string, number>
	): { success: boolean; error?: string } {
		try {
			const cfgPath = this.getEngineConfigPath(pd);
			const existing = this.fileSystemService.readJSON<EngineConfig>(cfgPath) ?? {
				...DEFAULT_ENGINE_CONFIG,
			};

			const updated: EngineConfig = { ...existing, shaders };

			const ok = this.fileSystemService.writeJSON<EngineConfig>(cfgPath, updated);
			if (ok) {
				return { success: true };
			}
			return { success: false, error: 'writeJSON returned false' };
		} catch (error) {
			return { success: false, error: String(error) };
		}
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

	public deleteFileFullPath(pathComplete: string, pd: ProjectData): boolean {
		try {
			const projectPath = this.fileSystemService.getProjectPath(pd);
			const completePath = path.join(projectPath, pathComplete);

			if (!this.fileSystemService.exists(completePath)) {
				console.log(`File does not exist: ${completePath}`);
				return false;
			}

			this.fileSystemService.deleteFile(completePath);

			if (this.currentWatchedFolder) {
				const folderPath = path.dirname(pathComplete);
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

	private normalizePath(p: string): string {
		return p.replace(/\\/g, '/');
	}

	private isEssentialFolder(relativeFolderPath: string): boolean {
		const normalized = this.normalizePath(relativeFolderPath);
		const essentialPaths = this.fileSystemService
			.getRequiredProjectPaths()
			.map((p) => this.normalizePath(p));

		return essentialPaths.some(
			(essential) => normalized === essential || essential.startsWith(normalized + '/')
		);
	}

	public deleteFolder(
		folderNode: FolderNode,
		pd: ProjectData
	): { success: boolean; error?: string; errorCode?: 'ESSENTIAL_FOLDER' } {
		try {
			if (this.isEssentialFolder(folderNode.path)) {
				return {
					success: false,
					error: `Cannot delete essential project folder: "${folderNode.name}"`,
					errorCode: 'ESSENTIAL_FOLDER',
				};
			}

			const projectPath = this.fileSystemService.getProjectPath(pd);
			const fullFolderPath = path.join(projectPath, folderNode.path);
			return this.fileSystemService.deleteFolder(fullFolderPath);
		} catch (error) {
			return { success: false, error: String(error) };
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
			const exists = this.fileSystemService.exists(completePath);
			const shouldCompress = exists && this.fileSystemService.isCompressed(completePath);
			let success = false;
			if (shouldCompress) {
				success = this.fileSystemService.saveCompressedFile(completePath, content);
			} else {
				success = this.fileSystemService.saveFile(completePath, content);
			}

			if (success) {
				return { success: true };
			} else {
				return { success: false };
			}
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}

	public async compressAllMaps(
		pd: ProjectData
	): Promise<{ success: boolean; count: number; error?: string }> {
		try {
			const projectPath = this.fileSystemService.getProjectPath(pd);
			const mapFiles = this.fileSystemService.findFilesByExtension(projectPath, '.map');
			let count = 0;

			for (const filePath of mapFiles) {
				if (this.fileSystemService.isCompressed(filePath)) continue;
				const content = this.fileSystemService.readFile(filePath);
				const ok = this.fileSystemService.saveCompressedFile(filePath, content);
				if (ok) count++;
			}

			return { success: true, count };
		} catch (error) {
			return { success: false, count: 0, error: String(error) };
		}
	}

	public async decompressAllMaps(
		pd: ProjectData
	): Promise<{ success: boolean; count: number; error?: string }> {
		try {
			const projectPath = this.fileSystemService.getProjectPath(pd);
			const mapFiles = this.fileSystemService.findFilesByExtension(projectPath, '.map');
			let count = 0;

			for (const filePath of mapFiles) {
				if (!this.fileSystemService.isCompressed(filePath)) continue;
				const content = this.fileSystemService.readCompressedFile(filePath);
				const ok = this.fileSystemService.saveFile(filePath, content);
				if (ok) count++;
			}

			return { success: true, count };
		} catch (error) {
			return { success: false, count: 0, error: String(error) };
		}
	}

	public saveFileCompletePath(
		name: string,
		completePath: string,
		content: string
	): { success: boolean; error?: string } {
		try {
			if (!this.fileSystemService.exists(completePath)) {
				const parentDir = path.dirname(completePath);
				if (!this.fileSystemService.exists(parentDir)) {
					return { success: false, error: `Parent directory does not exist: ${parentDir}` };
				}
				const createResult = this.fileSystemService.createFolder(completePath);
				if (!createResult.success) {
					return { success: false, error: createResult.error };
				}
			}

			if (name !== '') {
				completePath = path.join(completePath, name);
			}

			if (this.fileSystemService.saveFile(completePath, content)) {
				return { success: true };
			} else {
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
				return { success: false, error: 'File does not exist' };
			}

			if (this.fileSystemService.isDirectory(completePath)) {
				return { success: false, error: 'Path is a directory' };
			}

			const content = this.fileSystemService.isCompressed(completePath)
				? this.fileSystemService.readCompressedFile(completePath)
				: this.fileSystemService.readFile(completePath);

			const relativeP = path.join(folderPath, fileRelativePath);
			return { success: true, content: { relativePath: relativeP, content: content } };
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}

	public getFileFullPath(completePath: string): {
		success: boolean;
		content?: string;
		error?: string;
	} {
		try {
			if (!this.fileSystemService.exists(completePath)) {
				console.log(`File does not exist: ${completePath}`);
				return { success: false, error: 'File does not exist' };
			}

			if (this.fileSystemService.isDirectory(completePath)) {
				console.log(`Path is a directory, not a file: ${completePath}`);
				return { success: false, error: 'Path is a directory' };
			}

			const cont = this.fileSystemService.readFile(completePath);

			return { success: true, content: cont };
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

	public createFolder(
		folderNode: FolderNode,
		newFolderName: string,
		pd: ProjectData
	): { success: boolean; error?: string } {
		try {
			const projectPath = this.fileSystemService.getProjectPath(pd);
			const newFolderPath = path.join(projectPath, folderNode.path, newFolderName);
			return this.fileSystemService.createFolder(newFolderPath);
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}

	public setMainWindow(window: BrowserWindow): void {
		this.fileSystemWatcher.setMainWindow(window);
	}

	private getConfigPath(): string {
		if (!app.isPackaged) {
			return path.join(process.cwd(), 'src', 'assets', 'projects.json');
		}
		return path.join(app.getPath('userData'), 'projects.json');
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
				return false;
			}

			const requiredPaths = this.fileSystemService.getRequiredProjectPaths();
			return this.fileSystemService.validateRequiredDirectories(projectPath, requiredPaths);
		} catch (error) {
			log(error + ' (fail while validating project path)');
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
			this.ensureEngineConfig(pd);

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

			this.ensureEngineConfig(pd);

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

	public toRelativePath(absolutePath: string): { success: boolean; path?: string; error?: string } {
		try {
			const normalized = absolutePath.replace(/\\/g, '/');
			const marker = 'resources/';
			const idx = normalized.indexOf(marker);
			if (idx === -1) {
				return { success: false, error: 'Path does not contain resources/' };
			}
			return { success: true, path: normalized.slice(idx) };
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}

	private parseLogLine(raw: string): EngineLog | null {
		const trimmed = raw.trim();

		if (trimmed.length === 0) {
			return null;
		}

		const timestamp = Date.now();

		if (trimmed.startsWith('[ENGINE][ERROR]')) {
			const message = trimmed.slice('[ENGINE][ERROR]'.length).trim();
			return { message, level: 'error' as LogLevel, timestamp };
		}

		if (trimmed.startsWith('[ENGINE][WARN]')) {
			const message = trimmed.slice('[ENGINE][WARN]'.length).trim();
			return { message, level: 'warn' as LogLevel, timestamp };
		}

		if (trimmed.startsWith('[ENGINE]')) {
			const message = trimmed.slice('[ENGINE]'.length).trim();
			return { message, level: 'info' as LogLevel, timestamp };
		}

		return { message: trimmed, level: 'lua' as LogLevel, timestamp };
	}

	private pipeEngineLogs(child: ReturnType<typeof spawn>): void {
		let stdoutBuffer = '';
		let stderrBuffer = '';

		const emitLine = (line: string): void => {
			const engineLog = this.parseLogLine(line);
			if (engineLog) {
				this.fileSystemWatcher.notifyMainWindow('engine-log', engineLog);
			}
		};

		const handleChunk = (buffer: string, chunk: Buffer | string): string => {
			const accumulated = buffer + chunk.toString();
			const lines = accumulated.split(/\r?\n/);
			const incomplete = lines.pop() ?? '';
			lines.forEach(emitLine);
			return incomplete;
		};

		child.stdout?.on('data', (chunk: Buffer) => {
			stdoutBuffer = handleChunk(stdoutBuffer, chunk);
		});

		child.stdout?.on('end', () => {
			if (stdoutBuffer.length > 0) {
				emitLine(stdoutBuffer);
				stdoutBuffer = '';
			}
		});

		child.stderr?.on('data', (chunk: Buffer) => {
			stderrBuffer = handleChunk(stderrBuffer, chunk);
		});

		child.stderr?.on('end', () => {
			if (stderrBuffer.length > 0) {
				emitLine(stderrBuffer);
				stderrBuffer = '';
			}
		});
	}

	public runEngine(pd: ProjectData, mapPath?: string): { success: boolean; error?: string } {
		try {
			if (this.engineProcess && !this.engineProcess.killed) {
				return { success: false, error: 'Engine is already running' };
			}

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

			const args: string[] = [];
			if (mapPath) {
				args.push(mapPath);
			}

			const child = spawn(executablePath, args, {
				cwd: projectPath,
				detached: false,
				stdio: ['pipe', 'pipe', 'pipe'],
			});

			this.engineProcess = child;
			this.pipeEngineLogs(child);

			child.on('exit', (code, signal) => {
				console.log(`Engine exited with code ${code} and signal ${signal}`);
				this.engineProcess = null;
				this.fileSystemWatcher.notifyMainWindow('engine-exited', {});
			});

			child.on('error', (error) => {
				console.error(`Engine process error: ${error}`);
				this.engineProcess = null;
				this.fileSystemWatcher.notifyMainWindow('engine-exited', {});
			});

			console.log(`Engine started: ${executablePath}`, mapPath ? `with map: ${mapPath}` : '');
			return { success: true };
		} catch (error) {
			console.error(`Error running engine: ${error}`);
			this.engineProcess = null;
			return { success: false, error: String(error) };
		}
	}

	public sendEngineCommand(command: 'PAUSE' | 'RESUME'): { success: boolean; error?: string } {
		if (!this.engineProcess || this.engineProcess.killed) {
			return { success: false, error: 'No engine process is running' };
		}
		if (!this.engineProcess.stdin) {
			return { success: false, error: 'Engine stdin is not available' };
		}
		try {
			this.engineProcess.stdin.write(command + '\n');
			return { success: true };
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}

	public stopEngine(): { success: boolean; error?: string } {
		try {
			if (!this.engineProcess || this.engineProcess.killed) {
				return { success: false, error: 'No engine process is running' };
			}
			const killed = this.engineProcess.kill();

			if (killed) {
				console.log('Engine process killed successfully');
				this.engineProcess = null;
				return { success: true };
			} else {
				return { success: false, error: 'Failed to kill engine process' };
			}
		} catch (error) {
			console.error(`Error stopping engine: ${error}`);
			return { success: false, error: String(error) };
		}
	}

	public updateTags(
		pd: ProjectData,
		tags: Record<string, string>
	): { success: boolean; error?: string } {
		try {
			const cfgPath = this.getEngineConfigPath(pd);
			const existing = this.fileSystemService.readJSON<EngineConfig>(cfgPath) ?? {
				...DEFAULT_ENGINE_CONFIG,
			};

			const updated: EngineConfig = { ...existing, tags };

			const ok = this.fileSystemService.writeJSON<EngineConfig>(cfgPath, updated);
			if (ok) {
				return { success: true };
			}
			return { success: false, error: 'writeJSON returned false' };
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}

	public updateGameConfig(
		pd: ProjectData,
		gameConfig: GameConfig
	): { success: boolean; error?: string } {
		try {
			const cfgPath = this.getEngineConfigPath(pd);
			const existing = this.fileSystemService.readJSON<EngineConfig>(cfgPath) ?? {
				...DEFAULT_ENGINE_CONFIG,
			};

			const updated: EngineConfig = { ...existing, gameConfig };

			const ok = this.fileSystemService.writeJSON<EngineConfig>(cfgPath, updated);
			if (ok) {
				return { success: true };
			}
			return { success: false, error: 'writeJSON returned false' };
		} catch (error) {
			return { success: false, error: String(error) };
		}
	}

	public async splitTileset(
		imagePath: string,
		configPath: string,
		existingConfig: TileSetConfig,
		maxGpuSize: number
	) {
		return this.atlasService.splitTileset(imagePath, configPath, existingConfig, maxGpuSize);
	}
}
