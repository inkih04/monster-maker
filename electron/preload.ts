import { ipcRenderer, contextBridge } from 'electron';
import { ProjectData } from '../global/types/projectData';
import FolderNode from '../global/types/folderNode';
import { EngineLog } from '../global/types/engineLog';

contextBridge.exposeInMainWorld('api', {
	getProjects: () => ipcRenderer.invoke('config:getAll'),
	addProject: (pd: ProjectData) => ipcRenderer.invoke('config:add', pd),
	removeProject: (pd: ProjectData) => ipcRenderer.invoke('config:remove', pd),
	selectFolder: (defaultPath?: string) => ipcRenderer.invoke('config:selectFolder', defaultPath),
	openProject: (pd: ProjectData) => ipcRenderer.invoke('config:open', pd),
	validateProjectPath: (pd: ProjectData) => ipcRenderer.invoke('validate-project-path', pd),
	getDirectoryStructure: (pd: ProjectData) =>
		ipcRenderer.invoke('config:getDirectoryStructure', pd),

	pathUnion: (path1: string, path2: string) => ipcRenderer.invoke('config:pathUnion', path1, path2),
	toRelativePath: (absolutePath: string) =>
		ipcRenderer.invoke('config:toRelativePath', absolutePath),

	startWatchingDirectory: (pd: ProjectData) => ipcRenderer.invoke('config:startWatching', pd),
	stopWatchingDirectory: () => ipcRenderer.invoke('config:stopWatching'),
	onDirectoryStructureChanged: (callback: (structure: FolderNode[]) => void) => {
		ipcRenderer.on('directory-structure-changed', (_event, structure) => callback(structure));
		return () => ipcRenderer.removeAllListeners('directory-structure-changed');
	},
	selectFile: (defaultPath?: string, filters?: { name: string; extensions: string[] }[]) => ipcRenderer.invoke('config:selectFile', defaultPath, filters),
	onLanguageChange: (callback: (lng: string) => void) => {
		ipcRenderer.on('change-language', (_event, lng: string) => callback(lng));
		return () => ipcRenderer.removeAllListeners('change-language');
	},
	exportMap: (mapData: string) => ipcRenderer.invoke('export-map', mapData),
	onExportMapRequest: (callback: () => void) => {
		ipcRenderer.on('export-map-request', callback);
		return () => ipcRenderer.removeAllListeners('export-map-request');
	},
	onExportMapPNGRequest: (callback: () => void) => {
		ipcRenderer.on('export-map-PNG-request', callback);
		return () => ipcRenderer.removeAllListeners('export-map-PNG-request');
	},
	saveImage: (base64Data: string) => ipcRenderer.invoke('save-image', base64Data),
	getFilesInFolder: (pd: ProjectData, folder: FolderNode) =>
		ipcRenderer.invoke('config:getFilesInFolder', pd, folder),

	startWatchingFiles: (pd: ProjectData, folder: FolderNode) =>
		ipcRenderer.invoke('config:startWatchingFiles', pd, folder),
	stopWatchingFiles: () => ipcRenderer.invoke('config:stopWatchingFiles'),
	onFilesChanged: (callback: (files: string[]) => void) => {
		ipcRenderer.on('files-changed', (_event, files) => callback(files));
		return () => ipcRenderer.removeAllListeners('files-changed');
	},
	showFileContextMenu: (fileData: { name: string; path: string; type: string }) =>
		ipcRenderer.send('show-file-context-menu', fileData),
	onFileAction: (
		callback: (action: string, fileData: { name: string; path: string; type: string }) => void
	) => {
		const subscription = (
			_event: Electron.IpcRendererEvent,
			action: string,
			fileData: { name: string; path: string; type: string }
		) => callback(action, fileData);
		ipcRenderer.on('file-action', subscription);
		return () => ipcRenderer.removeListener('file-action', subscription);
	},
	deleteFile: (fileRelativePath: string, folderPath: string, pd: ProjectData) =>
		ipcRenderer.invoke('config:deleteFile', fileRelativePath, folderPath, pd),
	renameFile: (
		oldFileRelativePath: string,
		newFileName: string,
		folderPath: string,
		pd: ProjectData
	) => ipcRenderer.invoke('config:renameFile', oldFileRelativePath, newFileName, folderPath, pd),
	getFile: (fileRelativePath: string, folderPath: string, pd: ProjectData) =>
		ipcRenderer.invoke('config:getFile', fileRelativePath, folderPath, pd),
	saveFile: (fileRelativePath: string, content: string, pd: ProjectData) =>
		ipcRenderer.invoke('config:saveFile', fileRelativePath, content, pd),

	saveFileCompletePath: (name: string, completePath: string, content: string) =>
		ipcRenderer.invoke('config:saveFileCompletePath', name, completePath, content),

	onCreateNewFile: (callback: (fileType: 'map' | 'prefab' | 'script') => void) => {
		const subscription = (
			_event: Electron.IpcRendererEvent,
			fileType: 'map' | 'prefab' | 'script'
		) => callback(fileType);
		ipcRenderer.on('create-new-file', subscription);
		return () => ipcRenderer.removeListener('create-new-file', subscription);
	},

	onAddNewFile: (callback: () => void) => {
		ipcRenderer.on('add-new-file', callback);
		return () => ipcRenderer.removeAllListeners('add-new-file');
	},

	onCloseProject: (callback: () => void) => {
		ipcRenderer.on('close-project', callback);
		return () => ipcRenderer.removeAllListeners('close-project');
	},

	onSaveFile: (callback: () => void) => {
		ipcRenderer.on('save-file', callback);
		return () => ipcRenderer.removeAllListeners('save-file');
	},

	runEngine: (pd: ProjectData, mapPath?: string) =>
		ipcRenderer.invoke('config:runEngine', pd, mapPath),

	stopEngine: () => ipcRenderer.invoke('config:stopEngine'),

	onEngineExit: (callback: () => void) => {
		const subscription = (_event: Electron.IpcRendererEvent) => callback();
		ipcRenderer.on('engine-exited', subscription);
		return () => ipcRenderer.removeListener('engine-exited', subscription);
	},

	onEngineLog: (callback: (engineLog: EngineLog) => void) => {
		const subscription = (_event: Electron.IpcRendererEvent, engineLog: EngineLog) =>
			callback(engineLog);
		ipcRenderer.on('engine-log', subscription);
		return () => ipcRenderer.removeListener('engine-log', subscription);
	},

	onToggleCollisions: (callback: () => void) => {
		ipcRenderer.on('toggle-collisions', callback);
		return () => ipcRenderer.removeAllListeners('toggle-collisions');
	},
	onResetLayout: (callback: () => void) => {
		ipcRenderer.on('reset-layout', callback);
		return () => ipcRenderer.removeAllListeners('reset-layout');
	},
	showFolderContextMenu: (folderData: { name: string; path: string }) =>
		ipcRenderer.send('show-folder-context-menu', folderData),

	onFolderAction: (
		callback: (action: string, folderData: { name: string; path: string }) => void
	) => {
		const subscription = (
			_event: Electron.IpcRendererEvent,
			action: string,
			folderData: { name: string; path: string }
		) => callback(action, folderData);
		ipcRenderer.on('folder-action', subscription);
		return () => ipcRenderer.removeListener('folder-action', subscription);
	},
	onFolderMenuClosed: (callback: (folderData: { name: string; path: string }) => void) => {
		const subscription = (
			_event: Electron.IpcRendererEvent,
			folderData: { name: string; path: string }
		) => callback(folderData);
		ipcRenderer.on('folder-menu-closed', subscription);
		return () => ipcRenderer.removeListener('folder-menu-closed', subscription);
	},
	createFolder: (folderNode: FolderNode, newFolderName: string, pd: ProjectData) =>
		ipcRenderer.invoke('config:createFolder', folderNode, newFolderName, pd),
	deleteFolder: (folderNode: FolderNode, pd: ProjectData) =>
		ipcRenderer.invoke('config:deleteFolder', folderNode, pd),
	notifyLanguageChange: (lng: string) => ipcRenderer.send('language-changed', lng),
	
});
