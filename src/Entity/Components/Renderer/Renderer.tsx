import { Component, ComponentBody, ComponentHeader } from '../basic/InspectorComponent';
import { VideoCamera } from 'iconoir-react';
import './Renderer.css';
import { useMapStore } from '../../../Map/MapGState';
import NumberInput from '../../../common/components/numericInput/NumericInput';

function RendererComponent() {
	const selectedEntityId = useMapStore((state) => state.selectedEntityId);
	const map = useMapStore((state) => state.map);
	const updateComponent = useMapStore((state) => state.updateComponent);
	const entity = selectedEntityId && map ? map.entities[selectedEntityId] : null;
	const renderComponent = entity?.components.RENDER;
	const width = renderComponent?.width ?? 0;
	const height = renderComponent?.height ?? 0;

	if (!renderComponent) {
		return null;
	}

	if (!selectedEntityId) return;

	return (
		<Component id="Render">
			<ComponentHeader icon={VideoCamera}>Render</ComponentHeader>
			<ComponentBody>
				<div className="Componet-input-row">
					<span>Width: </span>
					<NumberInput
						value={width}
						step={8}
						min={8}
						onChange={(newWidth) =>
							updateComponent(selectedEntityId, 'RENDER', { width: newWidth })
						}
					/>
				</div>
				<div className="Componet-input-row">
					<span>Height: </span>
					<NumberInput
						value={height}
						onChange={(newHeight) =>
							updateComponent(selectedEntityId, 'RENDER', { height: newHeight })
						}
						step={8}
						min={8}
					/>
				</div>
			</ComponentBody>
		</Component>
	);
}

export default RendererComponent;
