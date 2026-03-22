export type ShaderMap = Record<string, number>;
export type TagMap = Record<string, string>;

export interface GameConfig {
	gameName: string;
	gameVersion: string;
	initialMapPath: string;
	imageIconPath: string;
	defaultFont: string;
	virtualWidth: number;
	virtualHeight: number;
}

export interface EngineConfig {
	shaders: ShaderMap;
	tags: TagMap;
	gameConfig: GameConfig;
}

export const DEFAULT_GAME_CONFIG: GameConfig = {
	gameName: 'Monster Maker Engine',
	gameVersion: '1.0.0',
	initialMapPath: '',
	imageIconPath: '',
	defaultFont: '',
	virtualWidth: 480,
	virtualHeight: 270,
};

export const DEFAULT_ENGINE_CONFIG: EngineConfig = {
	shaders: { default: 0, water: 1 },
	tags: {},
	gameConfig: { ...DEFAULT_GAME_CONFIG },
};
