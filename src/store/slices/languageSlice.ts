import { StateCreator } from 'zustand';

export type SupportedLanguage = 'en' | 'hi';

export interface LanguageSlice {
  // State
  currentLanguage: SupportedLanguage;
  availableLanguages: SupportedLanguage[];
  isRTL: boolean;

  // Actions
  setLanguage: (language: SupportedLanguage) => void;
  toggleLanguage: () => void;
}

export const createLanguageSlice: StateCreator<LanguageSlice> = (set, get) => ({
  // Initial State
  currentLanguage: 'en',
  availableLanguages: ['en', 'hi'],
  isRTL: false,

  // Actions
  setLanguage: (language) =>
    set({
      currentLanguage: language,
      isRTL: false, // Hindi is LTR, but this could be extended for RTL languages
    }),

  toggleLanguage: () => {
    const current = get().currentLanguage;
    const available = get().availableLanguages;
    const currentIndex = available.indexOf(current);
    const nextIndex = (currentIndex + 1) % available.length;
    const nextLanguage = available[nextIndex];
    
    set({
      currentLanguage: nextLanguage,
      isRTL: false,
    });
  },
});
