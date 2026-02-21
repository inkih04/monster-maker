import { useMemo } from 'react';
import { useMapStore } from '../../../Map/MapGState';
import { Component, ComponentBody, ComponentHeader } from '../basic/InspectorComponent';
import { FastArrowRight, WarningTriangle } from 'iconoir-react';
import { useTranslation } from 'react-i18next';

function MovementComponent() {
	const selectedEntityId = useMapStore((state) => state.selectedEntityId);
	const removeComponent = useMapStore((state) => state.removeComponent);
	const map = useMapStore((state) => state.map);
	const { t } = useTranslation();

	const entity = selectedEntityId ? map?.entities[selectedEntityId] : null;
	const movementData = entity?.components?.MOVEMENT;

	const isMissingDependencies = useMemo(() => {
		if (!entity) return false;
		const comps = entity.components;
		return !comps.POSITION || !comps.COLLIDER;
	}, [entity]);

	if (!selectedEntityId || !map || !movementData) return null;

	const handleDelete = () => {
		removeComponent(selectedEntityId, 'MOVEMENT');
	};

	const WarningIcon = isMissingDependencies ? (
		<WarningTriangle
			fill="#facc15"
			width={18}
			style={{ filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.2))' }}
		/>
	) : null;

	return (
		<Component id="Movement">
			<ComponentHeader icon={FastArrowRight} onDelete={handleDelete} action={WarningIcon}>
				Movement
			</ComponentHeader>
			<ComponentBody>
				<div>
					{t('movementComponent')}

				</div>
			</ComponentBody>
		</Component>
	);
}

export default MovementComponent;
