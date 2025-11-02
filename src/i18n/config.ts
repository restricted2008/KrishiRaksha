import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import enTranslations from '../locales/en/translations.json';
import hiTranslations from '../locales/hi/translations.json';

// Language configuration with support for 13 languages
// Currently implemented: English (en) and Hindi (hi)
// Ready to add: Punjabi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Odia, Urdu, Assamese
export const SUPPORTED_LANGUAGES = {
  en: { name: 'English', nativeName: 'English', flag: '🇬🇧' },
  hi: { name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
  // Future language support (add translations to enable):
  // pa: { name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  // ta: { name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  // te: { name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  // bn: { name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
  // mr: { name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  // gu: { name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
  // kn: { name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
  // ml: { name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
  // or: { name: 'Odia', nativeName: 'ଓଡ଼ିଆ', flag: '🇮🇳' },
  // ur: { name: 'Urdu', nativeName: 'اردو', flag: '🇮🇳' },
  // as: { name: 'Assamese', nativeName: 'অসমীয়া', flag: '🇮🇳' },
};

export const DEFAULT_LANGUAGE = 'en';
export const FALLBACK_LANGUAGE = 'en';

// Language resources
const resources = {
  en: {
    translation: enTranslations,
  },
  hi: {
    translation: hiTranslations,
  },
};

// Initialize i18next
i18n
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next) // Pass i18n down to react-i18next
  .init({
    resources,
    fallbackLng: FALLBACK_LANGUAGE,
    defaultNS: 'translation',
    supportedLngs: Object.keys(SUPPORTED_LANGUAGES),
    
    // Language detection options
    detection: {
      // Order of detection methods
      order: ['localStorage', 'navigator', 'htmlTag'],
      // Cache user language
      caches: ['localStorage'],
      // localStorage key
      lookupLocalStorage: 'i18nextLng',
    },

    // Interpolation options
    interpolation: {
      escapeValue: false, // React already escapes values
    },

    // React options
    react: {
      useSuspense: false, // Set to false to avoid suspense
    },

    // Development options
    debug: false, // Set to true for debugging
    
    // Load options
    load: 'languageOnly', // Load only language (e.g., 'en' not 'en-US')
  });

// Helper function to get current language info
export const getCurrentLanguageInfo = () => {
  const currentLang = i18n.language || DEFAULT_LANGUAGE;
  const langCode = currentLang.split('-')[0]; // Get base language code
  return SUPPORTED_LANGUAGES[langCode as keyof typeof SUPPORTED_LANGUAGES] || SUPPORTED_LANGUAGES[DEFAULT_LANGUAGE];
};

// Helper function to change language
export const changeLanguage = async (languageCode: string) => {
  try {
    await i18n.changeLanguage(languageCode);
    // Store in localStorage
    localStorage.setItem('i18nextLng', languageCode);
    // Update HTML lang attribute for accessibility
    document.documentElement.lang = languageCode;
    return true;
  } catch (error) {
    console.error('Failed to change language:', error);
    return false;
  }
};

// Helper function to get available languages
export const getAvailableLanguages = () => {
  return Object.entries(SUPPORTED_LANGUAGES).map(([code, info]) => ({
    code,
    ...info,
  }));
};

export default i18n;
