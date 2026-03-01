import { ProjectData } from '../global/types/projectData';
import FolderNode from '../global/types/folderNode';
import { FileData } from '../global/types/fileData';
import { ProjectFile } from '../global/types/projectFile';

export {};

declare global {
	interface Window {
		api: {
			getProjects: () => Promise<ProjectData[]>;
			addProject: (pd: ProjectData) => Promise<{ success: boolean; error?: string }>;
			removeProject: (pd: ProjectData) => Promise<{ success: boolean; error?: string }>;
			selectFolder: (
				defaultPath?: string
			) => Promise<{ success: boolean; path?: string; error?: string }>;
			selectFile: (
				defaultPath?: string,
				filters?: { name: string; extensions: string[] }[]
			) => Promise<{ success: boolean; path?: string; error?: string }>;
			toRelativePath: (
				absolutePath: string
			) => Promise<{ success: boolean; path?: string; error?: string }>;
			openProject: (pd: ProjectData) => Promise<{ success: boolean; error?: string }>;
			validateProjectPath: (pd: ProjectData) => Promise<boolean>;
			getDirectoryStructure: (
				pd: ProjectData
			) => Promise<{ success: boolean; structure: FolderNode[]; error?: string }>;
			getFilesInFolder: (
				pd: ProjectData,
				folder: FolderNode
			) => Promise<{ success: boolean; files: string[]; error?: string }>;
			startWatchingDirectory: (pd: ProjectData) => Promise<{ success: boolean; error?: string }>;
			stopWatchingDirectory: () => Promise<{ success: boolean; error?: string }>;
			onDirectoryStructureChanged: (callback: (structure: FolderNode[]) => void) => () => void;
			onLanguageChange: (callback: (lng: string) => void) => () => void;
			exportMap: (mapData: string) => Promise<{ success: boolean; path?: string; error?: string }>;
			onExportMapRequest: (callback: () => void) => () => void;
			onExportMapPNGRequest: (callback: () => void) => () => void;
			saveImage: (base64Data: string) => Promise<{ success: boolean; path?: string }>;
			startWatchingFiles: (
				pd: ProjectData,
				folder: FolderNode
			) => Promise<{ success: boolean; error?: string }>;
			stopWatchingFiles: () => Promise<{ success: boolean; error?: string }>;
			onFilesChanged: (callback: (files: string[]) => void) => () => void;
			showFileContextMenu: (fileData: FileData) => void;
			onFileAction: (callback: (action: string, fileData: FileData) => void) => () => void;
			deleteFile: (
				fileRelativePath: string,
				folderPath: string,
				pd: ProjectData
			) => Promise<{ success: boolean; error?: string }>;
			pathUnion: (path1: string, path2: string) => Promise<string>;
			renameFile: (
				oldFileRelativePath: string,
				newFileName: string,
				folderPath: string,
				pd: ProjectData
			) => Promise<{ success: boolean; error?: string }>;

			getFile: (
				fileRelativePath: string,
				folderPath: string,
				pd: ProjectData
			) => Promise<{ success: boolean; content?: ProjectFile; error?: string }>;

			saveFile: (
				fileRelativePath: string,
				content: string,
				pd: ProjectData
			) => Promise<{ success: boolean; error?: string }>;

			saveFileCompletePath: (
				name: string,
				completePath: string,
				content: string
			) => Promise<{ success: boolean; error?: string }>;

			onCreateNewFile: (callback: (fileType: 'map' | 'prefab' | 'script') => void) => () => void;
			onAddNewFile: (callback: () => void) => () => void;
			onCloseProject: (callback: () => void) => () => void;
			onSaveFile: (callback: () => void) => () => void;
			runEngine: (
				pd: ProjectData,
				mapPath?: string
			) => Promise<{ success: boolean; error?: string }>;
			stopEngine: () => Promise<{ success: boolean; error?: string }>;
			onEngineExit: (callback: () => void) => () => void;
			onToggleCollisions: (callback: () => void) => () => void;
			onResetLayout: (callback: () => void) => () => void;
			showFolderContextMenu: (folderData: { name: string; path: string }) => void;
			onFolderAction: (
				callback: (action: string, folderData: { name: string; path: string }) => void
			) => () => void;
			onFolderMenuClosed: (
				callback: (folderData: { name: string; path: string }) => void
			) => () => void;
			createFolder: (
				folderNode: FolderNode,
				newFolderName: string,
				pd: ProjectData
			) => Promise<{ success: boolean; error?: string }>;
			deleteFolder: (
				folderNode: FolderNode,
				pd: ProjectData
			) => Promise<{ success: boolean; error?: string; errorCode?: 'ESSENTIAL_FOLDER' }>;
			onEngineLog: (callback: (engineLog: EngineLog) => void) => () => void;
			notifyLanguageChange: (lng: string) => void;
		};
	}
}
