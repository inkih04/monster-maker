import { Database } from 'iconoir-react';
import { useMapStore } from '../../../Map/MapGState';
import { Component, ComponentHeader, ComponentBody } from '../basic/InspectorComponent';
import '../Script/ScriptComponent.css';
import { useTranslation } from 'react-i18next';

const PersistenceComponent = () => {
	const selectedEntityId = useMapStore((state) => state.selectedEntityId);
	const map = useMapStore((state) => state.map);
	const updateComponent = useMapStore((state) => state.updateComponent);
	const removeComponent = useMapStore((state) => state.removeComponent);
	const setIsDirty = useMapStore((state) => state.setIsDirty);
	const { t } = useTranslation();

	if (!selectedEntityId || !map) return null;
	const entity = map.entities[selectedEntityId];
	const persistenceData = entity?.components?.PERSISTENCE;

	if (!persistenceData) return null;

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		updateComponent(selectedEntityId, 'PERSISTENCE', {
			saveFlag: e.target.value,
		});
		setIsDirty(true);
	};

	const handleDelete = () => {
		removeComponent(selectedEntityId, 'PERSISTENCE');
		setIsDirty(true);
	};

	return (
		<Component>
			<ComponentHeader icon={Database} onDelete={handleDelete}>
				Persistence
			</ComponentHeader>
			<ComponentBody>
				<span> {t('persistenceComponent')}</span>
				<div style={{ marginTop: 8 }} className="Componet-input-row-path">
					<span>Flag: </span>
					<div className="script--input-wrapper">
						<input
							type="text"
							className="render-input script--input-path"
							value={persistenceData.saveFlag}
							onChange={handleChange}
							placeholder={`${selectedEntityId}`}
							spellCheck={false}
						/>
					</div>
				</div>
			</ComponentBody>
		</Component>
	);
};

export default PersistenceComponent;
