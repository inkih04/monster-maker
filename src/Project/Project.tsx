import './Project.css';
import { Trash } from 'iconoir-react';

interface ProjectProps {
	index: number;
	name: string;
	path: string;
	color?: string;
	onClick?: () => void;
	onDelete?: (e: React.MouseEvent) => void;
}

function Project(props: Readonly<ProjectProps>) {
	const getInitials = () => {
		const trimmed = props.name.trim();
		if (trimmed.length === 0) return '';
		if (trimmed.length === 1) return trimmed.toUpperCase();
		return trimmed.substring(0, 2).toUpperCase();
	};

	const handleDelete = (e: React.MouseEvent) => {
		e.stopPropagation();
		props.onDelete?.(e);
	};

	return (
		<button className="project-container" onClick={props.onClick}>
			<div className="project-color" style={{ backgroundColor: props.color }}>
				{getInitials()}
			</div>
			<div className="project-content">
				<span className="project-title"> {props.name} </span>
				<span className="project-path"> {props.path} </span>
			</div>
			<button
				className="project-delete-btn"
				onClick={handleDelete}
				tabIndex={-1}
				aria-label="Delete project"
			>
				<Trash />
			</button>
		</button>
	);
}

export default Project;