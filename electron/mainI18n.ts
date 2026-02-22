import i18n from 'i18next';
import en from '../src/assets/locales/en.json';
import es from '../src/assets/locales/es.json';

const mainI18n = i18n.createInstance();

mainI18n.init({
	resources: {
		en: { translation: en },
		es: { translation: es },
	},
	lng: 'en',
	fallbackLng: 'en',
	interpolation: { escapeValue: false },
});

export default mainI18n;
