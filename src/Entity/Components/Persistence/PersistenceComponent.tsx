import { Database } from 'iconoir-react';
import { Component, ComponentHeader, ComponentBody } from '../basic/InspectorComponent';
import '../Script/ScriptComponent.css';
import { useTranslation } from 'react-i18next';
import { useComponentEditor } from '../basic/useComponentEditor';

const PersistenceComponent = () => {
	const { entity, entityId, isMulti, count, update, remove } = useComponentEditor('PERSISTENCE');
	const { t } = useTranslation();

	if (!entityId) return null;
	const persistenceData = entity?.components?.PERSISTENCE;
	if (!persistenceData) return null;

	return (
		<Component>
			<ComponentHeader icon={Database} onDelete={remove}>
				Persistence{isMulti && <span className="component-header--batch-badge">×{count}</span>}
			</ComponentHeader>
			<ComponentBody>
				<span>{t('persistenceComponent')}</span>
				<div style={{ marginTop: 8 }} className="Componet-input-row-path">
					<span>Flag: </span>
					<div className="script--input-wrapper">
						<input
							type="text"
							className="render-input script--input-path"
							value={persistenceData.saveFlag}
							onChange={(e) => update({ saveFlag: e.target.value })}
							placeholder={`${entityId}`}
							spellCheck={false}
						/>
					</div>
				</div>
			</ComponentBody>
		</Component>
	);
};

export default PersistenceComponent;
