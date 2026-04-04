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
	shader: string;
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
}

export interface AnimationSet {
	animations: Animation[];
}

export interface AnimationComponent {
	defaultAnimation?: string;
	activeSet?: string;
	sets: Record<string, AnimationSet>;
}

export interface MovementComponent {}

export interface InteractionComponent {}

export interface ScriptComponent {
	path: string;
}

export interface PersistanceComponent {
	saveFlag: string;
}

export interface CollisionComponent {
	width: number;
	height: number;
	offsetY: number;
	offsetX: number;
	isTrigger: boolean;
}
