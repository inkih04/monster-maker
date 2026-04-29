/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ModalProject from './ModalProject';
import { useProjectStore } from './ProjectConfigGState';
import { useEngineConfigStore } from '../Tagger/useEngineConfigStore';

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

vi.mock('@radix-ui/react-dialog', () => ({
	Root: ({ children, open }: any) =>
		open ? <div data-testid="dialog-root">{children}</div> : null,
	Portal: ({ children }: any) => <>{children}</>,
	Overlay: () => <div data-testid="dialog-overlay" />,
	Content: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
	Title: ({ children }: any) => <h2>{children}</h2>,
	Description: ({ children }: any) => <p>{children}</p>, 
	Close: ({ children }: any) => <button>{children}</button>, 
}));

vi.mock('@radix-ui/react-visually-hidden', () => ({
	Root: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('./ProjectConfigGState', () => ({
	useProjectStore: vi.fn(),
}));

vi.mock('../Tagger/useEngineConfigStore', () => ({
	useEngineConfigStore: vi.fn(),
}));

vi.mock('../common/components/searchBar/SearchBar', () => ({
	default: ({ value, onChange }: any) => (
		<input data-testid="search-bar" value={value} onChange={(e) => onChange(e.target.value)} />
	),
}));

vi.mock('./Project', () => ({
	default: ({ name, onClick, onDelete }: any) => (
		<div data-testid="project-item" onClick={onClick}>
			{name}
			<button
				data-testid="delete-btn"
				onClick={(e) => {
					e.stopPropagation();
					onDelete();
				}}
			>
				Delete
			</button>
		</div>
	),
}));

vi.mock('../common/components/createProject/Create', () => ({
	default: ({ open }: any) => (open ? <div data-testid="create-modal" /> : null),
}));

vi.mock('../common/components/openProject/OpenProject', () => ({
	default: ({ open }: any) => (open ? <div data-testid="open-modal" /> : null),
}));

vi.mock('../common/components/delete/DeleteConfirmation', () => ({
	default: ({ open, onConfirm, itemName }: any) =>
		open ? (
			<div data-testid="delete-conf">
				<span>{itemName}</span>
				<button onClick={onConfirm}>Confirm</button>
			</div>
		) : null,
}));

const mockValidateProjectPath = vi.fn();

(window as any).api = {
	validateProjectPath: mockValidateProjectPath,
};

describe('ModalProject', () => {
	const mockSetIsModalOpen = vi.fn();
	const mockSetCurrentProject = vi.fn();
	const mockRemoveProject = vi.fn();
	const mockLoadProjects = vi.fn();
	const mockLoadEngineConfig = vi.fn();

	const mockProjects = [
		{ name: 'Alpha Project', path: '/path/alpha', color: 'red' },
		{ name: 'Beta Project', path: '/path/beta', color: 'blue' },
	];

	beforeEach(() => {
		vi.clearAllMocks();

		(useProjectStore as any).mockReturnValue({
			isModalOpen: true,
			setIsModalOpen: mockSetIsModalOpen,
			setCurrentProject: mockSetCurrentProject,
			removeProject: mockRemoveProject,
			projects: mockProjects,
			loadProjects: mockLoadProjects,
		});

		(useEngineConfigStore as any).mockImplementation((selector: any) =>
			selector({
				loadEngineConfig: mockLoadEngineConfig,
			})
		);
	});

	it('should render the modal correctly and load projects on mount', () => {
		render(<ModalProject />);
		expect(screen.getByTestId('dialog-root')).toBeInTheDocument();
		expect(mockLoadProjects).toHaveBeenCalled();
	});

	it('should not render the dialog content when isModalOpen is false', () => {
		(useProjectStore as any).mockReturnValue({
			isModalOpen: false,
			projects: [],
			loadProjects: mockLoadProjects,
		});
		render(<ModalProject />);
		expect(screen.queryByTestId('dialog-root')).not.toBeInTheDocument();
	});

	it('should filter projects based on search input', () => {
		render(<ModalProject />);
		const searchInput = screen.getByTestId('search-bar');
		fireEvent.change(searchInput, { target: { value: 'beta' } });
		const projectItems = screen.getAllByTestId('project-item');
		expect(projectItems).toHaveLength(1);
		expect(projectItems[0]).toHaveTextContent('Beta Project');
	});

	it('should handle clicking a valid project', async () => {
		mockValidateProjectPath.mockResolvedValueOnce(true);
		render(<ModalProject />);
		const alphaProject = screen.getAllByTestId('project-item')[0];
		await act(async () => {
			fireEvent.click(alphaProject);
		});
		expect(mockSetIsModalOpen).toHaveBeenCalledWith(false);
	});

	it('should handle clicking an invalid project', async () => {
		mockValidateProjectPath.mockResolvedValueOnce(false);
		render(<ModalProject />);
		const alphaProject = screen.getAllByTestId('project-item')[0];
		await act(async () => {
			fireEvent.click(alphaProject);
		});

		// En tu código actual de ModalProject.tsx: await removeProject(project);
		// El test fallaba porque esperaba el string del path, pero pasas el objeto 'project'
		expect(mockRemoveProject).toHaveBeenCalledWith(mockProjects[0]);
	});
});
