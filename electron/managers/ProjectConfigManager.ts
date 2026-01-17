import * as fs from 'fs';
import * as path from 'path';
import { ProjectsConfig } from '../../global/types/projectConfig';
import { ProjectData } from '../../global/types/projectData';
import { log } from 'console';

export class ProjectConfigManager {
	private configPath: string;
	private config: ProjectsConfig;

	constructor() {
		this.configPath = this.getConfigPath();
		this.config = this.loadConfig();
	}

	private getConfigPath(): string {
		if (process.env.NODE_ENV === 'development') {
			return path.join(process.cwd(), 'src', 'assets', 'projects.json');
		}

		return path.join(process.resourcesPath, 'assets', 'projects.json');
	}

	public loadConfig(): ProjectsConfig {
		try {
			if (fs.existsSync(this.configPath)) {
				const data = fs.readFileSync(this.configPath, 'utf-8');
				return JSON.parse(data);
			} else {
				const configToSave: ProjectsConfig = { projects: [] };
				fs.writeFileSync(this.configPath, JSON.stringify(configToSave, null, 2), 'utf-8');
				return configToSave;
			}
		} catch (error) {
			console.log(error + ' (fail while loading projects)');
		}

		return { projects: [] };
	}

	public saveProjectConfiguration() {
		if (fs.existsSync(this.configPath)) {
			fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2), 'utf-8');
		} else {
			let configToSave: ProjectsConfig = { projects: [] };
			if (this.config) configToSave = this.config;
			else this.config = configToSave;
			fs.writeFileSync(this.configPath, JSON.stringify(configToSave, null, 2), 'utf-8');
		}
	}

	public removeProject(pd: ProjectData): void {
		this.config.projects = this.config.projects.filter((p) => p.path !== pd.path);
		this.saveProjectConfiguration();
	}

	private addProjectData(pd: ProjectData): void {
		try {
			const projectPath = path.join(pd.path, pd.name);
			const existingIndex = this.config.projects.findIndex(
				(p) => path.join(p.path, p.name) === projectPath
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
			const projectPath = path.join(pd.path, pd.name);

			if (!fs.existsSync(projectPath)) {
				return false;
			}

			const requiredPaths = [
				path.join(projectPath, 'fonts'),
				path.join(projectPath, 'maps'),
				path.join(projectPath, 'maps', 'data'),
				path.join(projectPath, 'maps', 'tileset'),
				path.join(projectPath, 'sprites'),
				path.join(projectPath, 'scripts'),
			];

			const isValid = requiredPaths.every((p) => {
				return fs.existsSync(p) && fs.statSync(p).isDirectory();
			});

			if (!isValid) {
				log("falso")
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
			const projectPath = path.join(pd.path, pd.name);

			if (fs.existsSync(projectPath)) {
				return false;
			}

			fs.mkdirSync(projectPath, { recursive: true });

			fs.mkdirSync(path.join(projectPath, 'fonts'), { recursive: true });
			fs.mkdirSync(path.join(projectPath, 'maps', 'data'), { recursive: true });
			fs.mkdirSync(path.join(projectPath, 'maps', 'tileset'), { recursive: true });
			fs.mkdirSync(path.join(projectPath, 'sprites'), { recursive: true });
			fs.mkdirSync(path.join(projectPath, 'scripts'), { recursive: true });

			this.addProjectData(pd);

			return true;
		} catch (error) {
			log(error + ' (fail while creating project directory)');
			return false;
		}
	}

	public getRandomColor(): string {
		const colors = [
			'#FF6B6B',
			'#4ECDC4',
			'#45B7D1',
			'#FFA07A',
			'#98D8C8',
			'#F7DC6F',
			'#BB8FCE',
			'#85C1E2',
			'#F8B195',
			'#C06C84',
		];
		return colors[Math.floor(Math.random() * colors.length)];
	}
}
