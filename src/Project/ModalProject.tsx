import * as Dialog from '@radix-ui/react-dialog';
import { useEffect, useState, useMemo } from 'react';
import './ModalProject.css';
import SearchBar from '../common/components/searchBar/SearchBar';
import Project from './Project';
import Create from '../common/components/createProject/Create';
import { useProjectStore } from './ProjectConfigGState';
import OpenProject from '../common/components/openProject/OpenProject';
import { useTranslation } from 'react-i18next';
import { ProjectData } from '../../global/types/projectData';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { useEngineConfigStore } from '../Tagger/useEngineConfigStore';
import DeleteConfirmation from '../common/components/delete/DeleteConfirmation';

function ModalProject() {
	const { t } = useTranslation();
	const [showNewProject, setShowNewProject] = useState(false);
	const [showOpenProject, setShowOpenProject] = useState(false);
	const [searchValue, setSearchValue] = useState('');
	const { isModalOpen, setIsModalOpen, setCurrentProject, removeProject } = useProjectStore();
	const loadEngineConfig = useEngineConfigStore((get) => get.loadEngineConfig);
	const [projectToDelete, setProjectToDelete] = useState<ProjectData | null>(null);

	const { projects, loadProjects } = useProjectStore();

	useEffect(() => {
		loadProjects();
	}, [loadProjects]);

	const filteredProjects = useMemo(() => {
		if (!searchValue.trim()) return projects;
		const searchLower = searchValue.toLowerCase();
		return projects.filter((project) => project.name.toLowerCase().includes(searchLower));
	}, [projects, searchValue]);

	const handleProjectClick = async (project: ProjectData) => {
		const isValid = await window.api.validateProjectPath(project);

		if (!isValid) {
			await removeProject(project);
			return;
		}

		setIsModalOpen(false);
		setCurrentProject(project);
		loadEngineConfig(project);
	};

	const handleRemoveProject = async (project: ProjectData | null) => {
		if (!project) return
		const hasBeenDeleted = await removeProject(project);
		console.log(hasBeenDeleted);
		setProjectToDelete(null);
	};

	return (
		<>
			<Dialog.Root open={isModalOpen}>
				<Dialog.Portal>
					<Dialog.Overlay className="Dialog-overlay" />
					<Dialog.Content className="Dialog-wrapper">
						<VisuallyHidden.Root>
							<Dialog.Title>Project selector</Dialog.Title>
						</VisuallyHidden.Root>
						<div className="dialog-content">
							<div className="dialog-options-bar">
								<div className="dialog-searchbar">
									<SearchBar value={searchValue} onChange={setSearchValue} />
								</div>
								<div className="dialog-buttons">
									<button className="dialog-btn" onClick={() => setShowNewProject(true)}>
										{t('newProject')}
									</button>
									<button className="dialog-btn" onClick={() => setShowOpenProject(true)}>
										{t('open')}
									</button>
								</div>
							</div>
							<div className="dialog-projects">
								{filteredProjects.map((project, index) => (
									<Project
										onClick={() => handleProjectClick(project)}
										key={`${project.path}::${project.name}`}
										index={index}
										name={project.name}
										path={project.path}
										color={project.color}
										onDelete={() => setProjectToDelete(project)}
									/>
								))}
							</div>
						</div>
					</Dialog.Content>
				</Dialog.Portal>
			</Dialog.Root>

			<DeleteConfirmation
				open={projectToDelete !== null}
				onOpenChange={(open) => {
					if (!open) setProjectToDelete(null);
				}}
				itemName={projectToDelete?.name ?? ''}
				onConfirm={() => handleRemoveProject(projectToDelete)}
			/>

			<Create open={showNewProject} onOpenChange={setShowNewProject} />
			<OpenProject open={showOpenProject} onOpenChange={setShowOpenProject} />
		</>
	);
}

export default ModalProject;
