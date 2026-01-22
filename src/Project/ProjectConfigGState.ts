import { create } from 'zustand';
import { ProjectData } from '../../global/types/projectData';

interface ProjectStore {
	projects: ProjectData[];
	isLoading: boolean;
	currentProject: ProjectData | null;

	loadProjects: () => Promise<void>;
	addProject: (project: ProjectData) => Promise<{ success: boolean; error?: string }>;
	openProject: (project: ProjectData) => Promise<{ success: boolean; error?: string }>;
	removeProject: (path: string) => Promise<boolean>;
	setCurrentProject: (project: ProjectData | null) => void;
}

export const useProjectStore = create<ProjectStore>((set) => ({
	projects: [],
	currentProject: null,
	isLoading: false,

	setCurrentProject: (project) => set({ currentProject: project }),

	loadProjects: async () => {
		set({ isLoading: true });

		if (!window.api || !window.api.getProjects) {
			set({ isLoading: false });
			return;
		}

		try {
			const allProjects = await window.api.getProjects();
			set({
				projects: Array.isArray(allProjects) ? allProjects : [],
				isLoading: false,
			});
		} catch (error) {
			console.error('Error loading projects:', error);
			set({ projects: [], isLoading: false });
		}
	},

	addProject: async (project: ProjectData) => {
		if (!window.api || !window.api.addProject) {
			return { success: false, error: 'API not available' };
		}

		try {
			const result = await window.api.addProject(project);

			if (result.success) {
				await useProjectStore.getState().loadProjects();
				return { success: true };
			}
			return { success: false, error: result.error || 'Unknown error' };
		} catch (error) {
			console.error('Error adding project:', error);
			return { success: false, error: String(error) };
		}
	},

	openProject: async (project: ProjectData) => {
		if (!window.api || !window.api.openProject) {
			return { success: false, error: 'API not available' };
		}

		try {
			const result = await window.api.openProject(project);

			if (result.success) {
				await useProjectStore.getState().loadProjects();
				return { success: true };
			}
			console.log(result.error);

			return { success: false, error: result.error || 'Unknown error' };
		} catch (error) {
			console.error('Error opening project:', error);
			return { success: false, error: String(error) };
		}
	},

	removeProject: async (path: string) => {
		if (!window.api || !window.api.removeProject) return false;

		try {
			const project = useProjectStore.getState().projects.find((p) => p.path === path);
			if (!project) return false;

			const result = await window.api.removeProject(project);

			if (result.success) {
				await useProjectStore.getState().loadProjects();
				return true;
			}
			return false;
		} catch (error) {
			console.error('Error removing project:', error);
			return false;
		}
	},
}));
