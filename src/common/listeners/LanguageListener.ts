import { useEffect } from 'react';
import { useLocaleStore } from '../globalStores/useLocaleStore';

export const LanguageListener = () => {
	const setLanguage = useLocaleStore((state) => state.setLanguage);

	useEffect(() => {
		if (!window.api?.onLanguageChange) return;

		const off = window.api.onLanguageChange((lng: string) => {
			setLanguage(lng);
			console.log('idioma canviado');
		});

		return off;
	}, [setLanguage]);

	return null;
};
