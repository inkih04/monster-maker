export type LogLevel = 'info' | 'warn' | 'error' | 'lua';

export interface EngineLog {
	message: string;
	level: LogLevel;
	timestamp: number;
}
