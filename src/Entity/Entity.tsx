import { useMapStore } from '../Map/MapGState';
import { ComponentType } from '../domain/ecs/componentMap';

import RendererComponent from './Components/Renderer/Renderer';
import CollisionComponent from './Components/Collision/Collision';
import ScriptComponent from './Components/Script/ScriptComponent';
import MovementComponent from './Components/Movement/MovementComponent';
import AddComponent from './Components/basic/AddComponent';
import EntityHeader from './Components/basic/EntityHeader';
import { Tag } from '../domain/ecs/tags';

import './Entity.css';
import InteractionComponent from './Components/Interaction/InteractionComponent';
import AnimationInspector from './Components/Animation/AnimatorInspector';
import PersistenceComponent from './Components/Persistence/PersistenceComponent';
import { useTranslation } from 'react-i18next';

const COMPONENT_UI_MAP: Partial<Record<ComponentType, React.ComponentType>> = {
	RENDER: RendererComponent,
	COLLIDER: CollisionComponent,
	SCRIPT: ScriptComponent,
	MOVEMENT: MovementComponent,
	INTERACTION: InteractionComponent,
	ANIMATION: AnimationInspector,
	PERSISTENCE: PersistenceComponent,
};

const RENDER_ORDER: ComponentType[] = [
	'RENDER',
	'ANIMATION',
	'COLLIDER',
	'SCRIPT',
	'MOVEMENT',
	'INTERACTION',
	'PERSISTENCE',
];

function Entity() {
	const selectedEntityIds = useMapStore((state) => state.selectedEntityIds);
	const setIsDirty = useMapStore((state) => state.setIsDirty);
	const map = useMapStore((state) => state.map);
	const updateEntity = useMapStore((state) => state.updateEntity);
	const { t } = useTranslation();

	const selectedEntities = selectedEntityIds
		.map((id) => map?.entities[id])
		.filter((e): e is NonNullable<typeof e> => e != null);

	const isSingleSelection = selectedEntities.length === 1;
	const isMultiSelection = selectedEntities.length > 1;
	const selectedEntity = isSingleSelection ? selectedEntities[0] : null;
	const selectedEntityId = isSingleSelection ? selectedEntityIds[0] : null;

	const sharedComponentTypes: ComponentType[] = isMultiSelection
		? RENDER_ORDER.filter((type) =>
				selectedEntities.every((entity) => entity.components[type] != null)
			)
		: [];

	const handleUpdateName = (name: string) => {
		if (selectedEntityId) {
			updateEntity(selectedEntityId, { name });
		}
	};

	const handleUpdateTag = (tag: Tag) => {
		if (selectedEntityId) {
			updateEntity(selectedEntityId, { tag });
		}
		setIsDirty(true);
	};

	const singleActiveComponents = selectedEntity
		? RENDER_ORDER.filter((type) => selectedEntity.components[type] && COMPONENT_UI_MAP[type])
		: [];

	if (selectedEntities.length === 0) {
		return (
			<div className="Entity-container">
				<div className="entity--entity is-empty" />
			</div>
		);
	}

	if (isMultiSelection) {
		return (
			<div className="Entity-container">
				<div className="entity--entity">
					<div className="entity--multiselect-header">
						<span className="entity--multiselect-count">
							{selectedEntities.length} {t('selectedTiles')}
						</span>
						<span className="entity--multiselect-hint">
							{sharedComponentTypes.length > 0
								? t('commmonComponents')
								: t('no_common_components_title')}
						</span>
					</div>

					{sharedComponentTypes.length > 0 ? (
						<div className="entity--componentcontainer">
							{sharedComponentTypes.map((type) => {
								const ComponentToRender = COMPONENT_UI_MAP[type];
								if (!ComponentToRender) return null;

								return (
									<div key={type}>
										<div className="entity--separator" />
										<div>
											<ComponentToRender />
										</div>
									</div>
								);
							})}
						</div>
					) : (
						<div className="entity--multiselect-empty">
							<p>{t('no_common_components_description')}</p>
						</div>
					)}

					<div className="entity--separator" />
					<AddComponent />
				</div>
			</div>
		);
	}

	return (
		<div className="Entity-container">
			<div className="entity--entity">
				{selectedEntityId && selectedEntity && (
					<>
						<EntityHeader
							entity={selectedEntity}
							onUpdateName={handleUpdateName}
							onUpdateTag={handleUpdateTag}
						/>

						<div className="entity--componentcontainer">
							{singleActiveComponents.map((type) => {
								const ComponentToRender = COMPONENT_UI_MAP[type];
								if (!ComponentToRender) return null;

								return (
									<div key={type}>
										<div className="entity--separator" />
										<ComponentToRender />
									</div>
								);
							})}
						</div>

						<div className="entity--separator" />
						<AddComponent />
					</>
				)}
			</div>
		</div>
	);
}

export default Entity;
