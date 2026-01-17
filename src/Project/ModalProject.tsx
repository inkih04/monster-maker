import * as Dialog from '@radix-ui/react-dialog';
import { useEffect, useState, useMemo } from 'react';
import './ModalProject.css';
import SearchBar from '../common/components/searchBar/SearchBar';
import Project from './Project';
import Create from '../common/components/create/Create';
import { useProjectStore } from './ProjectConfigGState';
import OpenProject from '../common/components/openProject/OpenProject';

function ModalProject() {
	const [open, setOpen] = useState(true);
	const [showNewProject, setShowNewProject] = useState(false);
	const [showOpenProject, setShowOpenProject] = useState(false);
	const [searchValue, setSearchValue] = useState('');

	const { projects, loadProjects } = useProjectStore();

	useEffect(() => {
		loadProjects();
	}, [loadProjects]);


	const filteredProjects = useMemo(() => {
		if (!searchValue.trim()) {
			return projects;
		}

		const searchLower = searchValue.toLowerCase();
		return projects.filter((project) =>
			project.name.toLowerCase().includes(searchLower)
		);
	}, [projects, searchValue]);

	return (
		<>
			<Dialog.Root open={open}>
				<Dialog.Portal>
					<Dialog.Overlay className="Dialog-overlay" />
					<Dialog.Content className="Dialog-wrapper">
						<div className="dialog-content">
							<div className="dialog-options-bar">
								<div className="dialog-searchbar">
									<SearchBar 
										value={searchValue}
										onChange={setSearchValue}
									/>
								</div>
								<div className="dialog-buttons">
									<button className="dialog-btn" onClick={() => setShowNewProject(true)}>
										New Project
									</button>
									<button className="dialog-btn" onClick={() => setShowOpenProject(true)}>Open</button>
								</div>
							</div>
							<div className="dialog-projects">
								{
									filteredProjects.map((project, index) => (
										<Project 
											onClick={() => { setOpen(false) }}
											key={project.path}
											index={index}
											name={project.name}
											path={project.path}
											color={project.color}
										/>
									))}
							</div>
						</div>
					</Dialog.Content>
				</Dialog.Portal>
			</Dialog.Root>

			<Create open={showNewProject}  onOpenChange={setShowNewProject} />
			<OpenProject open={showOpenProject}  onOpenChange={setShowOpenProject} />
		</>
	);
}

export default ModalProject;