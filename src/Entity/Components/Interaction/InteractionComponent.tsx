import { useMemo } from 'react';
import { useMapStore } from '../../../Map/MapGState';
import { Component, ComponentBody, ComponentHeader } from '../basic/InspectorComponent';
import { Keyframe, WarningTriangle } from 'iconoir-react';
import { useTranslation } from 'react-i18next';

function InteractionComponent() {
	const selectedEntityId = useMapStore((state) => state.selectedEntityId);
	const removeComponent = useMapStore((state) => state.removeComponent);
	const map = useMapStore((state) => state.map);
	const { t } = useTranslation();
	const entity = selectedEntityId ? map?.entities[selectedEntityId] : null;

	const isMissingDependencies = useMemo(() => {
		if (!entity) return false;
		const comps = entity.components;
		return !comps.POSITION || !comps.COLLIDER;
	}, [entity]);

	if (!selectedEntityId) return;
	if (!map) return;

	const interactionData = entity?.components?.INTERACTION;

	if (!interactionData) return;

	const handleDelete = () => {
		removeComponent(selectedEntityId, 'INTERACTION');
	};

	const WarningIcon = isMissingDependencies ? (
		<WarningTriangle
			fill="#facc15"
			width={18}
			style={{ filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.2))' }}
		/>
	) : null;
	return (
		<Component id="Render">
			<ComponentHeader icon={Keyframe} onDelete={handleDelete} action={WarningIcon}>
				Interaction
			</ComponentHeader>
			<ComponentBody>
				<div>{t('interactionComponent')}</div>
			</ComponentBody>
		</Component>
	);
}

export default InteractionComponent;
