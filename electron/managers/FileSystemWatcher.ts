import chokidar, { FSWatcher } from 'chokidar';
import { BrowserWindow } from 'electron';

type WatcherCallback<T> = (data: T) => void;

interface WatcherConfig {
	persistent?: boolean;
	ignoreInitial?: boolean;
	depth?: number;
	awaitWriteFinish?: {
		stabilityThreshold: number;
		pollInterval: number;
	};
}

export class FileSystemWatcher {
	private watchers: Map<string, FSWatcher> = new Map();
	private mainWindow: BrowserWindow | null = null;

	constructor(mainWindow?: BrowserWindow) {
		if (mainWindow) {
			this.mainWindow = mainWindow;
		}
	}

	public setMainWindow(window: BrowserWindow): void {
		this.mainWindow = window;
	}

	public watchDirectory<T>(
		key: string,
		watchPath: string,
		onDataChange: WatcherCallback<T>,
		config: WatcherConfig = this.getDefaultConfig()
	): void {
		this.stopWatcher(key);

		const watcher = chokidar.watch(watchPath, config);

		watcher
			.on('addDir', () => onDataChange(this.getData<T>(key)))
			.on('unlinkDir', () => onDataChange(this.getData<T>(key)))
			.on('error', (error) => console.error(`Watcher error (${key}):`, error));

		this.watchers.set(key, watcher);
		console.log(`Started watching directory (${key}):`, watchPath);
	}

	public watchFiles<T>(
		key: string,
		watchPath: string,
		onDataChange: WatcherCallback<T>,
		config: WatcherConfig = this.getDefaultConfig()
	): void {
		this.stopWatcher(key);

		const watcher = chokidar.watch(watchPath, config);

		watcher
			.on('add', () => onDataChange(this.getData<T>(key)))
			.on('unlink', () => onDataChange(this.getData<T>(key)))
			.on('change', () => onDataChange(this.getData<T>(key)))
			.on('error', (error) => console.error(`Watcher error (${key}):`, error));

		this.watchers.set(key, watcher);
		console.log(`Started watching files (${key}):`, watchPath);
	}

	public stopWatcher(key: string): void {
		const watcher = this.watchers.get(key);
		if (watcher) {
			watcher.close();
			this.watchers.delete(key);
			console.log(`Stopped watching (${key})`);
		}
	}

	public stopAllWatchers(): void {
		this.watchers.forEach((watcher, key) => {
			watcher.close();
			console.log(`Stopped watching (${key})`);
		});
		this.watchers.clear();
	}

	public notifyMainWindow<T>(channel: string, data: T): void {
		if (!this.mainWindow) {
			console.warn('Main window not set, cannot send notification');
			return;
		}
		this.mainWindow.webContents.send(channel, data);
	}

	private getDefaultConfig(): WatcherConfig {
		return {
			persistent: true,
			ignoreInitial: true,
			depth: 10,
			awaitWriteFinish: {
				stabilityThreshold: 100,
				pollInterval: 100,
			},
		};
	}

	private getData<T>(key: string): T {
		return null as T;
	}
}
