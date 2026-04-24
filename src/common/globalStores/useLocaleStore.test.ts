import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useLocaleStore } from './useLocaleStore';
import i18n from '../../i18n';

vi.mock('../../i18n', () => ({
	default: {
		changeLanguage: vi.fn(),
	},
}));

const mockNotifyLanguageChange = vi.fn();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).api = {
	notifyLanguageChange: mockNotifyLanguageChange,
};

describe('useLocaleStore', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		useLocaleStore.setState({ language: 'en' });
	});

	it('should have "en" as the default language', () => {
		const state = useLocaleStore.getState();
		expect(state.language).toBe('en');
	});

	it('should update the language state', () => {
		useLocaleStore.getState().setLanguage('es');
		expect(useLocaleStore.getState().language).toBe('es');
	});

	it('should call i18n.changeLanguage with the new language', () => {
		const newLang = 'fr';
		useLocaleStore.getState().setLanguage(newLang);
		expect(i18n.changeLanguage).toHaveBeenCalledWith(newLang);
	});

	it('should call window.api.notifyLanguageChange to inform the main process', () => {
		const newLang = 'de';
		useLocaleStore.getState().setLanguage(newLang);
		expect(mockNotifyLanguageChange).toHaveBeenCalledWith(newLang);
	});

	it('should execute all side effects in order when changing language', () => {
		useLocaleStore.getState().setLanguage('it');
		
		expect(i18n.changeLanguage).toHaveBeenCalled();
		expect(mockNotifyLanguageChange).toHaveBeenCalled();
		expect(useLocaleStore.getState().language).toBe('it');
	});
});