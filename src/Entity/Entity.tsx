import { useMapStore } from '../Map/MapGState';
import Renderer from './Components/Renderer/Renderer';

import './Entity.css';
import { Tag } from '../domain/ecs/tags';
import EntityHeader from './Components/basic/EntityHeader';
import CollisionComponent from './Components/Collision/Collision';
import AddComponent from './Components/basic/AddComponent';

function Entity() {
	const selectedEntityId = useMapStore((state) => state.selectedEntityId);
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
	};

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
						<div className="entity--separator"></div>

						<div className="entity--componentcontainer">
							<Renderer />
							<div className="entity--separator"></div>
							<CollisionComponent />
						</div>
						<div className="entity--separator"></div>
						<AddComponent/>
					</>
				)}
			</div>
		</div>
	);
}

export default Entity;
