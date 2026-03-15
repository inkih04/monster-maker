import React from 'react';
import ReactDOM from 'react-dom/client';
import Layout from './Layout/Layout.tsx';
import './index.css';
import { LanguageListener } from './common/listeners/LanguageListener.ts';
import { FileListener } from './common/listeners/FileListener.ts';
import { ToastProvider } from './common/components/toast/ToastContext'; 

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<ToastProvider>
			<FileListener />
			<LanguageListener />
			<Layout />
		</ToastProvider>
	</React.StrictMode>
);

