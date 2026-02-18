import { Component, ComponentBody, ComponentHeader } from '../basic/InspectorComponent';
import { ViewGrid } from 'iconoir-react';
import { useMapStore } from '../../../Map/MapGState';
import NumberInput from '../../../common/components/numericInput/NumericInput';
import './Collision.css';
import '../Renderer/Renderer.css';

function Collision() {
	const selectedEntityId = useMapStore((state) => state.selectedEntityId);
	const map = useMapStore((state) => state.map);
	const updateComponent = useMapStore((state) => state.updateComponent);
	const removeComponent = useMapStore((state) => state.removeComponent);

	const entity = selectedEntityId && map ? map.entities[selectedEntityId] : null;

	const collisionComponent = entity?.components.COLLIDER;

	if (!collisionComponent || !selectedEntityId) {
		return null;
	}

	const width = collisionComponent.width ?? 0;
	const height = collisionComponent.height ?? 0;
	const offsetX = collisionComponent.offsetX ?? 0;
	const offsetY = collisionComponent.offsetY ?? 0;
	const isTrigger = collisionComponent.isTrigger ?? false;

	const handleUpdate = (field: string, value: number | boolean) => {
		updateComponent(selectedEntityId, 'COLLIDER', { [field]: value });
	};

	const handleDelete = () => {
		removeComponent(selectedEntityId, 'COLLIDER');
	};

	const TriggerSwitch = (
		<div className="trigger-container">
			<span>Trigger:</span>
			<input
				type="checkbox"
				className="trigger-checkbox"
				checked={isTrigger}
				onChange={(e) => handleUpdate('isTrigger', e.target.checked)}
			/>
		</div>
	);

	return (
		<Component id="Collision">
			<ComponentHeader icon={ViewGrid} action={TriggerSwitch} onDelete={handleDelete}>
				Collision
			</ComponentHeader>

			<ComponentBody>
				<div className="collision-body-grid">
					<div className="collision-column">
						<div className="Componet-input-row">
							<span>Width:</span>
							<NumberInput
								value={width}
								step={8}
								min={1}
								onChange={(val) => handleUpdate('width', val)}
							/>
						</div>
						<div className="Componet-input-row">
							<span>Height:</span>
							<NumberInput
								value={height}
								step={8}
								min={1}
								onChange={(val) => handleUpdate('height', val)}
							/>
						</div>
					</div>

					<div className="collision-column">
						<div className="Componet-input-row">
							<span>OX:</span>
							<NumberInput
								value={offsetX}
								step={1}
								onChange={(val) => handleUpdate('offsetX', val)}
							/>
						</div>
						<div className="Componet-input-row">
							<span>OY:</span>
							<NumberInput
								value={offsetY}
								step={1}
								onChange={(val) => handleUpdate('offsetY', val)}
							/>
						</div>
					</div>
				</div>
			</ComponentBody>
		</Component>
	);
}

export default Collision;
