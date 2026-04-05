import { useMemo } from 'react';
import { Component, ComponentBody, ComponentHeader } from '../basic/InspectorComponent';
import { FastArrowRight, WarningTriangle } from 'iconoir-react';
import { useTranslation } from 'react-i18next';
import { useComponentEditor } from '../basic/useComponentEditor';

function MovementComponent() {
	const { entity, entityId, isMulti, count, remove } = useComponentEditor('MOVEMENT');
	const { t } = useTranslation();

	const movementData = entity?.components?.MOVEMENT;

	const isMissingDependencies = useMemo(() => {
		if (!entity) return false;
		const comps = entity.components;
		return !comps.POSITION || !comps.COLLIDER;
	}, [entity]);

	if (!entityId || !movementData) return null;

	const WarningIcon = isMissingDependencies ? (
		<WarningTriangle
			fill="#facc15"
			width={18}
			style={{ filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.2))' }}
		/>
	) : null;

	return (
		<Component id="Movement">
			<ComponentHeader icon={FastArrowRight} onDelete={remove} action={WarningIcon}>
				Movement{isMulti && <span className="component-header--batch-badge">×{count}</span>}
			</ComponentHeader>
			<ComponentBody>
				<div>{t('movementComponent')}</div>
			</ComponentBody>
		</Component>
	);
}

export default MovementComponent;
