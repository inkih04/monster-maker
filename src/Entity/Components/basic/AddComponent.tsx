import { useState, useRef, useEffect, useMemo } from 'react';
import { Plus, Search, ViewGrid, Code, Play } from 'iconoir-react';
import { useMapStore } from '../../../Map/MapGState';
import { ComponentType, ComponentMap } from '../../../domain/ecs/componentMap';
import './AddComponent.css';

type IconType = React.ComponentType<React.SVGProps<SVGSVGElement>>;

type AddableComponentConfig = Partial<{
	[K in ComponentType]: {
		icon: IconType;
		label: string;
		initData: ComponentMap[K];
	};
}>;

const ADDABLE_COMPONENTS: AddableComponentConfig = {
	COLLIDER: {
		icon: ViewGrid,
		label: 'Collision',
		initData: {
			width: 16,
			height: 16,
			offsetX: 0,
			offsetY: 0,
			isTrigger: false,
		},
	},

	SCRIPT: {
		icon: Code,
		label: 'Script',
		initData: { scriptPath: '' },
	},
	ANIMATION: {
		icon: Play,
		label: 'Animation',
		initData: { animations: [] },
	},
};

export default function AddComponent() {
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [searchTerm, setSearchTerm] = useState<string>('');
	const menuRef = useRef<HTMLDivElement>(null);

	const selectedEntityId = useMapStore((state) => state.selectedEntityId);
	const map = useMapStore((state) => state.map);
	const addComponent = useMapStore((state) => state.addComponent);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const availableComponents = useMemo(() => {
		if (!selectedEntityId || !map) return [];

		const entity = map.entities[selectedEntityId];
		if (!entity) return [];
		const currentKeys = Object.keys(entity.components) as ComponentType[];

		const allowedKeys = Object.keys(ADDABLE_COMPONENTS) as ComponentType[];

		return allowedKeys
			.filter((type) => !currentKeys.includes(type))
			.filter((type) => {
				const config = ADDABLE_COMPONENTS[type];
				return config ? config.label.toLowerCase().includes(searchTerm.toLowerCase()) : false;
			});
	}, [map, selectedEntityId, searchTerm]);

	const handleAddComponent = (type: ComponentType) => {
		if (!selectedEntityId) return;

		const config = ADDABLE_COMPONENTS[type];
		if (config) {
			addComponent(selectedEntityId, type, config.initData);
			setIsOpen(false);
			setSearchTerm('');
		}
	};

	if (!selectedEntityId) return null;

	return (
		<div className="component--Add-container" ref={menuRef}>
			<button
				className={`component--Add-button ${isOpen ? 'is-active' : ''}`}
				onClick={() => setIsOpen(!isOpen)}
			>
				<Plus width={18} strokeWidth={2.5} />
				<span>Add Component</span>
			</button>

			{isOpen && (
				<div className="component--Add-menu">
					<div className="component--Add-search">
						<Search width={14} />
						<input
							type="text"
							placeholder="Search..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							autoFocus
						/>
					</div>

					<div className="component--Add-list">
						{availableComponents.length === 0 ? (
							<div className="component--Add-no-results">
								{searchTerm ? 'No matches found' : 'All components added'}
							</div>
						) : (
							availableComponents.map((type) => {
								const config = ADDABLE_COMPONENTS[type];
								if (!config) return null;

								const { icon: Icon, label } = config;
								return (
									<button
										key={type}
										className="component--Add-item"
										onClick={() => handleAddComponent(type)}
									>
										<Icon width={16} />
										<span>{label}</span>
									</button>
								);
							})
						)}
					</div>
				</div>
			)}
		</div>
	);
}
