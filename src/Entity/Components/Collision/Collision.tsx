import { Component, ComponentBody, ComponentHeader } from '../basic/InspectorComponent';
import { ViewGrid } from 'iconoir-react';
import NumberInput from '../../../common/components/numericInput/NumericInput';
import './Collision.css';
import '../Renderer/Renderer.css';
import { useComponentEditor } from '../basic/useComponentEditor';

function Collision() {
	const { entity, entityId, isMulti, count, update, remove } = useComponentEditor('COLLIDER');

	const collisionComponent = entity?.components.COLLIDER;

	if (!collisionComponent || !entityId) return null;

	const width = collisionComponent.width ?? 0;
	const height = collisionComponent.height ?? 0;
	const offsetX = collisionComponent.offsetX ?? 0;
	const offsetY = collisionComponent.offsetY ?? 0;
	const isTrigger = collisionComponent.isTrigger ?? false;

	const TriggerSwitch = (
		<div className="trigger-container">
			<span>Trigger:</span>
			<input
				type="checkbox"
				className="trigger-checkbox"
				checked={isTrigger}
				onChange={(e) => update({ isTrigger: e.target.checked })}
			/>
		</div>
	);

	return (
		<Component id="Collision">
			<ComponentHeader icon={ViewGrid} action={TriggerSwitch} onDelete={remove}>
				Collision{isMulti && <span className="component-header--batch-badge">×{count}</span>}
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
								onChange={(val) => update({ width: val })}
							/>
						</div>
						<div className="Componet-input-row">
							<span>Height:</span>
							<NumberInput
								value={height}
								step={8}
								min={1}
								onChange={(val) => update({ height: val })}
							/>
						</div>
					</div>

					<div className="collision-column">
						<div className="Componet-input-row">
							<span>OX:</span>
							<NumberInput value={offsetX} step={1} onChange={(val) => update({ offsetX: val })} />
						</div>
						<div className="Componet-input-row">
							<span>OY:</span>
							<NumberInput value={offsetY} step={1} onChange={(val) => update({ offsetY: val })} />
						</div>
					</div>
				</div>
			</ComponentBody>
		</Component>
	);
}

export default Collision;
