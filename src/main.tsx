import React from 'react';
import ReactDOM from 'react-dom/client';
import Layout from './Layout/Layout.tsx';
import './index.css';
import { LanguageListener } from './common/listeners/LanguageListener.ts';
import { FileListener } from './common/listeners/FileListener.ts';

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<FileListener/>
		<LanguageListener />
		<Layout />
	</React.StrictMode>
);

// Use contextBridge
window.ipcRenderer.on('main-process-message', (_event, message) => {
	console.log(message);
});
