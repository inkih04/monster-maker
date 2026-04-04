import {
	PositionComponent,
	RenderComponent,
	AnimationComponent,
	MovementComponent,
	CollisionComponent,
	ScriptComponent,
	InteractionComponent,
	PersistanceComponent,
} from './components';

export type ComponentMap = {
	POSITION: PositionComponent;
	RENDER: RenderComponent;
	ANIMATION: AnimationComponent;
	MOVEMENT: MovementComponent;
	COLLIDER: CollisionComponent;
	SCRIPT: ScriptComponent;
	INTERACTION: InteractionComponent;
	PERSISTENCE: PersistanceComponent;
};

export type ComponentType = keyof ComponentMap;
