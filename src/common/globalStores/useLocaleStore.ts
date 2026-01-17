import {create} from 'zustand';
import i18n from '../../i18n';

interface LocaleState {
  language: string;
  setLanguage: (lng: string) => void;
}

export const useLocaleStore = create<LocaleState>((set) => ({
  language: 'en',
  setLanguage: (lng) => {
    i18n.changeLanguage(lng);
    set({ language: lng });
  }
}));
