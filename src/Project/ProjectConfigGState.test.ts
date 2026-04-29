import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useProjectStore } from './ProjectConfigGState';
import { ProjectData } from '../../global/types/projectData';

const mockGetProjects = vi.fn();
const mockAddProject = vi.fn();
const mockOpenProject = vi.fn();
const mockRemoveProject = vi.fn();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).api = {
	getProjects: mockGetProjects,
	addProject: mockAddProject,
	openProject: mockOpenProject,
	removeProject: mockRemoveProject,
};

describe('useProjectStore', () => {
	const mockProject: ProjectData = {
		id: '1',
		name: 'Test Project',
		path: '/mock/path',
		defaultTilesize: 16,
	} as ProjectData;

	beforeEach(() => {
		vi.clearAllMocks();
		useProjectStore.getState().reset();
	});

	it('should have correct default state', () => {
		const state = useProjectStore.getState();
		expect(state.projects).toEqual([]);
		expect(state.currentProject).toBeNull();
		expect(state.isLoading).toBe(false);
		expect(state.isModalOpen).toBe(true);
	});

	it('should update modal state', () => {
		useProjectStore.getState().setIsModalOpen(false);
		expect(useProjectStore.getState().isModalOpen).toBe(false);
	});

	it('should update current project', () => {
		useProjectStore.getState().setCurrentProject(mockProject);
		expect(useProjectStore.getState().currentProject).toEqual(mockProject);
	});

	it('should reset state correctly', () => {
		const store = useProjectStore.getState();
		store.setCurrentProject(mockProject);
		store.setIsModalOpen(false);

		store.reset();

		const state = useProjectStore.getState();
		expect(state.currentProject).toBeNull();
		expect(state.isLoading).toBe(false);
		expect(state.isModalOpen).toBe(true);
	});

	describe('loadProjects', () => {
		it('should load projects successfully', async () => {
			const projects = [mockProject];
			mockGetProjects.mockResolvedValue(projects);

			await useProjectStore.getState().loadProjects();

			const state = useProjectStore.getState();
			expect(state.projects).toEqual(projects);
			expect(state.isLoading).toBe(false);
			expect(mockGetProjects).toHaveBeenCalledTimes(1);
		});

		it('should handle load errors and set empty array', async () => {
			mockGetProjects.mockRejectedValue(new Error('Failed to load'));

			await useProjectStore.getState().loadProjects();

			const state = useProjectStore.getState();
			expect(state.projects).toEqual([]);
			expect(state.isLoading).toBe(false);
		});
	});

	describe('addProject', () => {
		it('should add project and reload projects on success', async () => {
			mockAddProject.mockResolvedValue({ success: true });
			mockGetProjects.mockResolvedValue([mockProject]);

			const result = await useProjectStore.getState().addProject(mockProject);

			expect(result).toEqual({ success: true });
			expect(mockAddProject).toHaveBeenCalledWith(mockProject);
			expect(mockGetProjects).toHaveBeenCalled();
			expect(useProjectStore.getState().projects).toEqual([mockProject]);
		});

		it('should return error if add project fails', async () => {
			mockAddProject.mockResolvedValue({ success: false, error: 'File exists' });

			const result = await useProjectStore.getState().addProject(mockProject);

			expect(result).toEqual({ success: false, error: 'File exists' });
			expect(mockGetProjects).not.toHaveBeenCalled();
		});
	});

	describe('openProject', () => {
		it('should open project and reload projects on success', async () => {
			mockOpenProject.mockResolvedValue({ success: true });
			mockGetProjects.mockResolvedValue([mockProject]);

			const result = await useProjectStore.getState().openProject(mockProject);

			expect(result).toEqual({ success: true });
			expect(mockOpenProject).toHaveBeenCalledWith(mockProject);
			expect(mockGetProjects).toHaveBeenCalled();
		});

		it('should return error if open project fails', async () => {
			mockOpenProject.mockResolvedValue({ success: false, error: 'Corrupted file' });

			const result = await useProjectStore.getState().openProject(mockProject);

			expect(result).toEqual({ success: false, error: 'Corrupted file' });
			expect(mockGetProjects).not.toHaveBeenCalled();
		});
	});

	describe('removeProject', () => {
		it('should remove project and reload projects on success', async () => {
			useProjectStore.setState({ projects: [mockProject] });
			mockRemoveProject.mockResolvedValue({ success: true });
			mockGetProjects.mockResolvedValue([]);

			const result = await useProjectStore.getState().removeProject(mockProject);

			expect(result).toBe(true);
			expect(mockRemoveProject).toHaveBeenCalledWith(mockProject);
			expect(mockGetProjects).toHaveBeenCalled();
			expect(useProjectStore.getState().projects).toEqual([]);
		});

		it('should return false if remove project fails', async () => {
			useProjectStore.setState({ projects: [mockProject] });
			mockRemoveProject.mockResolvedValue({ success: false });

			const result = await useProjectStore.getState().removeProject(mockProject);

			expect(result).toBe(false);
		});
	});
});
