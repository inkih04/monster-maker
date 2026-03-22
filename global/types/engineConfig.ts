export type ShaderMap = Record<string, number>;
export type TagMap = Record<string, string>;
export type GameConfig = Record<string, string | number | boolean>;

export interface EngineConfig {
	tags: TagMap;
	shaders: ShaderMap;
	gameConfig: GameConfig;
}

export const DEFAULT_ENGINE_CONFIG: EngineConfig = {
	tags: {},
	shaders: {
		default: 0,
		water: 1,
	},
	gameConfig: {},
};
