import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Component, ComponentBody, ComponentHeader } from '../basic/InspectorComponent';
import { VideoCamera, NavArrowDown } from 'iconoir-react';
import './Renderer.css';
import { useMapStore } from '../../../Map/MapGState';
import NumberInput from '../../../common/components/numericInput/NumericInput';
import { useEngineConfigStore } from '../../../Tagger/useEngineConfigStore';
import { DEFAULT_SHADER_TAG } from '../../../Tagger/body/Shaders/shaderEntryUtils';

function ShaderSelect({
	value,
	options,
	onChange,
}: {
	value: string;
	options: string[];
	onChange: (val: string) => void;
}) {
	const [open, setOpen] = useState(false);
	const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
	const triggerRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		if (!open) return;
		const handleClickOutside = (e: MouseEvent) => {
			if (triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
				setOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [open]);

	const handleOpen = () => {
		if (triggerRef.current) {
			const rect = triggerRef.current.getBoundingClientRect();
			setDropdownStyle({
				position: 'fixed',
				top: rect.bottom + 3,
				left: rect.left,
				width: rect.width,
			});
		}
		setOpen((o) => !o);
	};

	return (
		<div className="render-select-wrapper">
			<button ref={triggerRef} className="render-select-trigger" onClick={handleOpen}>
				<span className="render-select-value">{value}</span>
				<NavArrowDown
					width={12}
					strokeWidth={2}
					className={`render-select-arrow ${open ? 'is-open' : ''}`}
				/>
			</button>
			{open &&
				createPortal(
					<ul className="render-select-dropdown" style={dropdownStyle}>
						{options.map((option) => (
							<li
								key={option}
								className={`render-select-option ${option === value ? 'is-selected' : ''}`}
								onMouseDown={() => {
									onChange(option);
									setOpen(false);
								}}
							>
								{option}
							</li>
						))}
					</ul>,
					document.body
				)}
		</div>
	);
}

function RendererComponent() {
	const selectedEntityId = useMapStore((state) => state.selectedEntityId);
	const map = useMapStore((state) => state.map);
	const updateComponent = useMapStore((state) => state.updateComponent);
	const setIsDirty = useMapStore((state) => state.setIsDirty);
	const shaders = useEngineConfigStore((state) => state.shaders);

	const entity = selectedEntityId && map ? map.entities[selectedEntityId] : null;
	const renderComponent = entity?.components.RENDER;

	if (!renderComponent || !selectedEntityId) return null;

	const width = renderComponent.width ?? 0;
	const height = renderComponent.height ?? 0;
	const shaderValue = renderComponent.shader || DEFAULT_SHADER_TAG;
	const shaderOptions = [
		DEFAULT_SHADER_TAG,
		...Object.keys(shaders).filter((k) => k !== DEFAULT_SHADER_TAG),
	];

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
						onChange={(newWidth) => {
							updateComponent(selectedEntityId, 'RENDER', { width: newWidth });
							setIsDirty(true);
						}}
					/>
				</div>
				<div className="Componet-input-row">
					<span>Height: </span>
					<NumberInput
						value={height}
						step={8}
						min={8}
						onChange={(newHeight) => {
							updateComponent(selectedEntityId, 'RENDER', { height: newHeight });
							setIsDirty(true);
						}}
					/>
				</div>
				<div className="Componet-input-row">
					<span>Shader: </span>
					<ShaderSelect
						value={shaderValue}
						options={shaderOptions}
						onChange={(val) => {
							updateComponent(selectedEntityId, 'RENDER', { shader: val });
							setIsDirty(true);
						}}
					/>
				</div>
			</ComponentBody>
		</Component>
	);
}

export default RendererComponent;
