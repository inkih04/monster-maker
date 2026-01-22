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
			selectFolder: () => Promise<{ success: boolean; path?: string; error?: string }>;
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
			onSaveFile: (callback: () => void) => () => void;
		};
	}
}
