import { useState, useRef, useEffect, useMemo } from 'react';
import {
	Plus,
	Search,
	ViewGrid,
	Code,
	Play,
	FastArrowRight,
	Keyframe,
	Database,
} from 'iconoir-react';
import { useMapStore } from '../../../Map/MapGState';
import { ComponentType, ComponentMap } from '../../../domain/ecs/componentMap';
import './AddComponent.css';
import { useTranslation } from 'react-i18next';
import { makeEmptySet, DEFAULT_SET } from '../Animation/customHooks/useAnimationInspector';

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
		initData: { path: '' },
	},
	ANIMATION: {
		icon: Play,
		label: 'Animation',
		initData: {
			defaultAnimation: 'standdown',
			sets: { [DEFAULT_SET]: makeEmptySet() },
		},
	},
	MOVEMENT: {
		icon: FastArrowRight,
		label: 'Movement',
		initData: {},
	},
	INTERACTION: {
		icon: Keyframe,
		label: 'Interaction',
		initData: {},
	},
	PERSISTENCE: {
		icon: Database,
		label: 'Persistence',
		initData: { saveFlag: '' },
	},
};

export default function AddComponent() {
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [searchTerm, setSearchTerm] = useState<string>('');
	const menuRef = useRef<HTMLDivElement>(null);
	const { t } = useTranslation();

	const selectedEntityId = useMapStore((state) => state.selectedEntityId);
	const selectedEntityIds = useMapStore((state) => state.selectedEntityIds);
	const map = useMapStore((state) => state.map);
	const addComponent = useMapStore((state) => state.addComponent);
	const setIsDirty = useMapStore((state) => state.setIsDirty);

	const isMulti = selectedEntityIds.length > 1;

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
		if (!map) return [];

		const allowedKeys = Object.keys(ADDABLE_COMPONENTS) as ComponentType[];

		if (isMulti) {
			const entities = selectedEntityIds
				.map((id) => map.entities[id])
				.filter((e): e is NonNullable<typeof e> => e != null);

			if (entities.length === 0) return [];

			return allowedKeys.filter((type) => {
				const noneHasIt = entities.every((e) => e.components[type] == null);
				if (!noneHasIt) return false;
				if (type === 'MOVEMENT' || type === 'INTERACTION') {
					const allHaveDeps = entities.every(
						(e) => e.components.COLLIDER != null && e.components.SCRIPT != null
					);
					if (!allHaveDeps) return false;
				}

				const config = ADDABLE_COMPONENTS[type];
				return config ? config.label.toLowerCase().includes(searchTerm.toLowerCase()) : false;
			});
		}
		const singleId = selectedEntityIds[0];
		if (!singleId) return [];
		const entity = map.entities[singleId];
		if (!entity) return [];
		const currentKeys = Object.keys(entity.components) as ComponentType[];
		const hasDependencies = currentKeys.includes('COLLIDER') && currentKeys.includes('SCRIPT');

		return allowedKeys
			.filter((type) => !currentKeys.includes(type))
			.filter((type) => {
				if (type === 'MOVEMENT' || type === 'INTERACTION') {
					if (!hasDependencies) return false;
				}
				const config = ADDABLE_COMPONENTS[type];
				return config ? config.label.toLowerCase().includes(searchTerm.toLowerCase()) : false;
			});
	}, [map, selectedEntityId, selectedEntityIds, isMulti, searchTerm]);

	const handleAddComponent = (type: ComponentType) => {
		const config = ADDABLE_COMPONENTS[type];
		if (!config) return;

		if (isMulti) {
			selectedEntityIds.forEach((id) => {
				const entity = map?.entities[id];
				if (!entity || entity.components[type] != null) return;

				const componentData =
					type === 'PERSISTENCE' ? { ...config.initData, saveFlag: id } : config.initData;

				addComponent(id, type, componentData);
			});
		} else {
			if (!selectedEntityId) return;

			const componentData =
				type === 'PERSISTENCE'
					? { ...config.initData, saveFlag: selectedEntityId }
					: config.initData;

			addComponent(selectedEntityId, type, componentData);
		}

		setIsOpen(false);
		setSearchTerm('');
		setIsDirty(true);
	};

	if (selectedEntityIds.length === 0) return null;

	return (
		<div className="component--Add-container" ref={menuRef}>
			<button
				className={`component--Add-button ${isOpen ? 'is-active' : ''}`}
				onClick={() => setIsOpen(!isOpen)}
			>
				<Plus width={18} strokeWidth={2.5} />
				<span>{t('addComponent')}</span>
			</button>

			{isOpen && (
				<div className="component--Add-menu">
					<div className="component--Add-search">
						<Search width={14} />
						<input
							type="text"
							placeholder={t('search')}
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							autoFocus
						/>
					</div>

					<div className="component--Add-list">
						{availableComponents.length === 0 ? (
							<div className="component--Add-no-results">
								{searchTerm ? 'No matches found' : 'No components available'}
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
