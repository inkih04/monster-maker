import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import React from 'react';
import ReactDOM from 'react-dom/client';
import Layout from './Layout/Layout.tsx';
import './index.css';
import { LanguageListener } from './common/listeners/LanguageListener.ts';
import { FileListener } from './common/listeners/FileListener.ts';
import { ToastProvider } from './common/components/toast/ToastContext'; 

self.MonacoEnvironment = {
	getWorker(_: unknown, label: string) {
		if (label === 'css' || label === 'scss' || label === 'less') {
			return new cssWorker();
		}
		if (label === 'html' || label === 'handlebars' || label === 'razor') {
			return new htmlWorker();
		}
		return new editorWorker();
	},
};

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<ToastProvider>
			<FileListener />
			<LanguageListener />
			<Layout />
		</ToastProvider>
	</React.StrictMode>
);

