export interface PositionComponent {
	x: number;
	y: number;
	rotation: number;
}

export interface RenderComponent {
	spriteSheetPath: string;
	x: number;
	y: number;
	w: number;
	h: number;
	width: number;
	height: number;
}

export interface AnimationFrame {
	x: number;
	y: number;
	w: number;
	h: number;
}

export interface Animation {
	name: string;
	frames: AnimationFrame[];
	frameDuration: number;
	loop: boolean;
	priority: number;
}

export interface AnimationComponent {
	animations: Animation[];
}

export interface MovementComponent {}

export interface ScriptComponent {
	path: string;
}

export interface CollisionComponent {
	width: number;
	height: number;
	offsetY: number;
	offsetX: number;
	isTrigger: boolean;
}
