import React, { createContext, useContext, useState, useCallback } from 'react';
import * as Toast from '@radix-ui/react-toast';
import './ToastContext.css';

type ToastType = 'success' | 'error';

interface ToastMessage {
	id: string;
	title: string;
	description?: string;
	duration?: number;
	type: ToastType;
}

interface ToastContextType {
	notify: (title: string, description?: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [toasts, setToasts] = useState<ToastMessage[]>([]);

	const notify = useCallback(
		(title: string, description?: string, type: ToastType = 'success', duration?: number) => {
			setToasts((prev) => [
				...prev,
				{ id: crypto.randomUUID(), title, description, type, duration },
			]);
		},
		[]
	);

	return (
		<ToastContext.Provider value={{ notify }}>
			<Toast.Provider swipeDirection="right">
				{children}

				{toasts.map(({ id, title, description, type, duration }) => {
					const finalDuration = duration ?? (type === 'error' ? 4000 : 1000);

					return (
						<Toast.Root
							key={id}
							className={`ToastRoot ${type}`}
							duration={finalDuration}
							onOpenChange={(open) => {
								if (!open) {
									setTimeout(() => {
										setToasts((prev) => prev.filter((t) => t.id !== id));
									}, 200);
								}
							}}
						>
							<div className="ToastText">
								<Toast.Title className="ToastTitle">{title}</Toast.Title>
								{description && (
									<Toast.Description className="ToastDescription">{description}</Toast.Description>
								)}
							</div>
							<Toast.Close className="ToastClose">×</Toast.Close>
						</Toast.Root>
					);
				})}

				<Toast.Viewport className="ToastViewport" />
			</Toast.Provider>
		</ToastContext.Provider>
	);
};

export const useNotify = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useNotify debe usarse dentro de ToastProvider');
  return context;
};
