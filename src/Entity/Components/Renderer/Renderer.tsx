import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Component, ComponentBody, ComponentHeader } from '../basic/InspectorComponent';
import { VideoCamera, NavArrowDown } from 'iconoir-react';
import './Renderer.css';
import { useMapStore } from '../../../Map/MapGState';
import NumberInput from '../../../common/components/numericInput/NumericInput';
import { useEngineConfigStore } from '../../../Tagger/useEngineConfigStore';
import { DEFAULT_SHADER_TAG } from '../../../Tagger/body/Shaders/shaderEntryUtils';
import { useComponentEditor } from '../basic/useComponentEditor';

function ShaderSelect({
	value,
	options,
	onChange,
}: Readonly<{
	value: string;
	options: string[];
	onChange: (val: string) => void;
}>) {
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
	const { entity, entityId, isMulti, count, update } = useComponentEditor('RENDER');
	const shaders = useEngineConfigStore((state) => state.shaders);

	const renderComponent = entity?.components.RENDER;

	if (!renderComponent || !entityId) return null;

	const width = renderComponent.width ?? 0;
	const height = renderComponent.height ?? 0;
	const shaderValue = renderComponent.shader || DEFAULT_SHADER_TAG;
	const shaderOptions = [
		DEFAULT_SHADER_TAG,
		...Object.keys(shaders).filter((k) => k !== DEFAULT_SHADER_TAG),
	];

	return (
		<Component id="Render">
			<ComponentHeader icon={VideoCamera}>
				Render{isMulti && <span className="component-header--batch-badge">×{count}</span>}
			</ComponentHeader>
			<ComponentBody>
				<div className="Componet-input-row">
					<span>Width: </span>
					<NumberInput
						value={width}
						step={8}
						min={8}
						onChange={(newWidth) => update({ width: newWidth })}
					/>
				</div>
				<div className="Componet-input-row">
					<span>Height: </span>
					<NumberInput
						value={height}
						step={8}
						min={8}
						onChange={(newHeight) => update({ height: newHeight })}
					/>
				</div>
				<div className="Componet-input-row">
					<span>Shader: </span>
					<ShaderSelect
						value={shaderValue}
						options={shaderOptions}
						onChange={(val) => update({ shader: val })}
					/>
				</div>
			</ComponentBody>
		</Component>
	);
}

export default RendererComponent;
