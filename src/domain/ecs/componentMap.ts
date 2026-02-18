import {
	PositionComponent,
	RenderComponent,
	AnimationComponent,
	MovementComponent,
	CollisionComponent,
	ScriptComponent,
	InteractionComponent,
} from './components';

export type ComponentMap = {
	POSITION: PositionComponent;
	RENDER: RenderComponent;
	ANIMATION: AnimationComponent;
	MOVEMENT: MovementComponent;
	COLLIDER: CollisionComponent;
	SCRIPT: ScriptComponent;
	INTERACTION: InteractionComponent;
};

export type ComponentType = keyof ComponentMap;
