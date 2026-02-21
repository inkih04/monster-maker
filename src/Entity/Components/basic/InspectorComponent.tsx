import React, { useState } from 'react';
import './InspectorComponent.css';

interface ComponentProps extends React.HTMLAttributes<HTMLDivElement> {
	children: React.ReactNode;
}

export const Component = ({ children, className, ...props }: ComponentProps) => {
	return (
		<div className={`inspector-component ${className || ''}`} {...props}>
			{children}
		</div>
	);
};

interface HeaderProps {
	children: React.ReactNode;
	icon?: React.ElementType;
	action?: React.ReactNode;
	onDelete?: () => void;
}

export const ComponentHeader = ({ children, icon: Icon, action, onDelete }: HeaderProps) => {
	const [isHovered, setIsHovered] = useState(false);

	return (
		<div
			className="inspector-header"
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			{onDelete && isHovered && (
				<button
					className="inspector-delete-btn"
					onClick={onDelete}
					aria-label="Eliminar componente"
				>
					×
				</button>
			)}
			<div className="inspector-header-left">
				{Icon && <Icon className="inspector-icon" />}
				<span className="inspector-title">{children}</span>
			</div>
			{action && <div className="inspector-header-right">{action}</div>}
		</div>
	);
};

export const ComponentBody = ({ children }: { children: React.ReactNode }) => {
	return (
		<div className="inspector-body">
			<div className="inspector-separator" />
			<div className="inspector-content">{children}</div>
		</div>
	);
};

