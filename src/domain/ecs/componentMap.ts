import {
	PositionComponent,
	RenderComponent,
	AnimationComponent,
	MovementComponent,
	CollisionComponent,
	ScriptComponent,
} from './components';

export type ComponentMap = {
	POSITION: PositionComponent;
	RENDER: RenderComponent;
	ANIMATION: AnimationComponent;
	MOVEMENT: MovementComponent;
	COLLIDER: CollisionComponent;
	SCRIPT: ScriptComponent;
};

export type ComponentType = keyof ComponentMap;
