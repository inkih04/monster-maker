import { ipcRenderer, contextBridge } from 'electron';
import { ProjectData } from '../global/types/projectData';

contextBridge.exposeInMainWorld('api', {
	getProjects: () => ipcRenderer.invoke('config:getAll'),
	addProject: (pd: ProjectData) => ipcRenderer.invoke('config:add', pd),
	removeProject: (pd: ProjectData) => ipcRenderer.invoke('config:remove', pd),
	selectFolder: () => ipcRenderer.invoke('config:selectFolder'),
	openProject: (pd: ProjectData) => ipcRenderer.invoke('config:open', pd),
	onLanguageChange: (callback: (lng: string) => void) => {
		ipcRenderer.on('change-language', (_event, lng: string) => callback(lng));
		return () => ipcRenderer.removeAllListeners('change-language');
	},
});
