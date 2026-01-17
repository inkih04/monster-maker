import { ProjectData } from '../global/types/projectData';

export {};

declare global {
	interface Window {
		api: {
			getProjects: () => Promise<ProjectData[]>;
			addProject: (pd: ProjectData) => Promise<{ success: boolean; error?: string }>;
			removeProject: (pd: ProjectData) => Promise<{ success: boolean; error?: string }>;
			selectFolder: () => Promise<{ success: boolean; path?: string; error?: string }>;
			openProject: (pd: ProjectData) => Promise<{ success: boolean; error?: string }>;
			onLanguageChange: (callback: (lng: string) => void) => () => void;
			exportMap: (mapData: string) => Promise<{ success: boolean; path?: string; error?: string }>;
			onExportMapRequest: (callback: () => void) => () => void;
		};
	}
}
