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

const COMPONENT_UI_MAP: Partial<Record<ComponentType, React.ComponentType>> = {
	RENDER: RendererComponent,
	COLLIDER: CollisionComponent,
	SCRIPT: ScriptComponent,
	MOVEMENT: MovementComponent,
	INTERACTION: InteractionComponent,
	ANIMATION: AnimationInspector,
};

const RENDER_ORDER: ComponentType[] = [
	'RENDER',
	'ANIMATION',
	'COLLIDER',
	'SCRIPT',
	'MOVEMENT',
	'INTERACTION',
];

function Entity() {
	const selectedEntityId = useMapStore((state) => state.selectedEntityId);
	const setIsDirty = useMapStore((state) => state.setIsDirty);
	const selectedEntity = useMapStore((state) =>
		selectedEntityId ? state.map?.entities[selectedEntityId] : null
	);
	const updateEntity = useMapStore((state) => state.updateEntity);

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

	const activeComponents = selectedEntity
		? RENDER_ORDER.filter((type) => selectedEntity.components[type] && COMPONENT_UI_MAP[type])
		: [];

	return (
		<div className="Entity-container">
			<div className={`entity--entity ${!selectedEntityId ? 'is-empty' : ''}`}>
				{selectedEntityId && selectedEntity && (
					<>
						<EntityHeader
							entity={selectedEntity}
							onUpdateName={handleUpdateName}
							onUpdateTag={handleUpdateTag}
						/>

						<div className="entity--componentcontainer">
							{activeComponents.map((type) => {
								const ComponentToRender = COMPONENT_UI_MAP[type];

								if (!ComponentToRender) return null;

								return (
									<div key={type}>
										<div className="entity--separator"></div>
										<ComponentToRender />
									</div>
								);
							})}
						</div>

						<div className="entity--separator"></div>
						<AddComponent />
					</>
				)}
			</div>
		</div>
	);
}

export default Entity;
