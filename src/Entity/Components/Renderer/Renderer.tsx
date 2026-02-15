import { Component, ComponentBody, ComponentHeader } from '../basic/InspectorComponent';
import { VideoCamera } from 'iconoir-react';
import './Renderer.css';

function Renderer() {
	return (
		<Component id="Render">
			<ComponentHeader icon={VideoCamera} onDelete={() => console.log('Componente eliminado')}>
				Render
			</ComponentHeader>
			<ComponentBody>
				<div className="Componet-input-row">
					<span>Width: </span>
					<div>10</div>
				</div>
				<div className="Componet-input-row">
					<span>Height: </span>
					<div>10</div>
				</div>
			</ComponentBody>
		</Component>
	);
}

export default Renderer;
