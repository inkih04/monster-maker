export type ShaderMap = Record<string, number>;

export interface MapEntry {
	[mapName: string]: string; 
}

export interface EngineConfig {
	maps: MapEntry[];
	shaders: ShaderMap;
}

export const DEFAULT_ENGINE_CONFIG: EngineConfig = {
	maps: [],
	shaders: {
		default: 0,
	},
};