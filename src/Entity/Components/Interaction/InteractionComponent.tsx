import { useMemo } from 'react';
import { Component, ComponentBody, ComponentHeader } from '../basic/InspectorComponent';
import { Keyframe, WarningTriangle } from 'iconoir-react';
import { useTranslation } from 'react-i18next';
import { useComponentEditor } from '../basic/useComponentEditor';

function InteractionComponent() {
	const { entity, entityId, isMulti, count, remove } = useComponentEditor('INTERACTION');
	const { t } = useTranslation();

	const interactionData = entity?.components?.INTERACTION;

	const isMissingDependencies = useMemo(() => {
		if (!entity) return false;
		const comps = entity.components;
		return !comps.POSITION || !comps.COLLIDER;
	}, [entity]);

	if (!entityId || !interactionData) return null;

	const WarningIcon = isMissingDependencies ? (
		<WarningTriangle
			fill="#facc15"
			width={18}
			style={{ filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.2))' }}
		/>
	) : null;

	return (
		<Component id="Render">
			<ComponentHeader
				icon={Keyframe}
				onDelete={!isMulti ? remove : undefined}
				action={WarningIcon}
			>
				Interaction{isMulti && <span className="component-header--batch-badge">×{count}</span>}
			</ComponentHeader>
			<ComponentBody>
				<div>{t('interactionComponent')}</div>
			</ComponentBody>
		</Component>
	);
}

export default InteractionComponent;
