import { useMapStore } from '../../../Map/MapGState';
import { ComponentType, ComponentMap } from '../../../domain/ecs/componentMap';


export function useComponentEditor<K extends ComponentType>(componentType: K) {
	const selectedEntityIds = useMapStore((state) => state.selectedEntityIds);
	const map = useMapStore((state) => state.map);
	const updateComponent = useMapStore((state) => state.updateComponent);
	const updateComponentBatch = useMapStore((state) => state.updateComponentBatch);
	const removeComponent = useMapStore((state) => state.removeComponent);
	const setIsDirty = useMapStore((state) => state.setIsDirty);

	const entityId = selectedEntityIds[0] ?? null;
	const entity = entityId && map ? map.entities[entityId] : null;
	const isMulti = selectedEntityIds.length > 1;
	const count = selectedEntityIds.length;

	const update = (data: Partial<ComponentMap[K]>) => {
		if (!entityId) return;
		if (isMulti) {
			updateComponentBatch(selectedEntityIds, componentType, data);
		} else {
			updateComponent(entityId, componentType, data);
		}
		setIsDirty(true);
	};

	const remove = () => {
		if (!entityId) return;
		selectedEntityIds.forEach((id) => {
			const e = map?.entities[id];
			if (e?.components[componentType] != null) {
				removeComponent(id, componentType);
			}
		});
		setIsDirty(true);
	};

	return { entityId, entity, isMulti, count, update, remove };
}
