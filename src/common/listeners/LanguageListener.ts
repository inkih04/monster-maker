import { useEffect } from 'react';
import { useLocaleStore } from '../globalStores/useLocaleStore';

export const LanguageListener = () => {
	const setLanguage = useLocaleStore((state) => state.setLanguage);

	useEffect(() => {
		const updateLanguage = async () => {
			const savedLanguage = await window.api.getLanguage();
			setLanguage(savedLanguage);
		};
		updateLanguage();
	}, []);

	useEffect(() => {
		if (!window.api?.onLanguageChange) return;

		const off = window.api.onLanguageChange(async (lng: string) => {
			setLanguage(lng);
			await window.api.saveLanguage(lng);
		});

		return off;
	}, [setLanguage]);

	return null;
};
