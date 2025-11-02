import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';
import { getAvailableLanguages, changeLanguage, getCurrentLanguageInfo } from '../i18n/config';
import { useEscapeKey, useFocusTrap } from '../hooks/useKeyboardNavigation';

interface LanguageSelectorProps {
  className?: string;
  showLabel?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  className = '',
  showLabel = false 
}) => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  
  const currentLanguage = i18n.language || 'en';
  const currentLangInfo = getCurrentLanguageInfo();
  const availableLanguages = getAvailableLanguages();

  // Keyboard navigation
  useEscapeKey(() => setIsOpen(false), isOpen);
  useFocusTrap(modalRef, isOpen);

  const handleLanguageChange = async (langCode: string) => {
    const success = await changeLanguage(langCode);
    if (success) {
      setIsOpen(false);
      // Optional: Show success toast
    }
  };

  return (
    <>
      {/* Language Selector Button */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label={t('language.changeLanguage')}
        className={`flex items-center gap-2 tap-target rounded-lg px-3 py-2 transition-colors hover:bg-gray-100 ${className}`}
        style={{ minHeight: '44px' }}
      >
        <Globe className="w-5 h-5" aria-hidden="true" />
        {showLabel && (
          <span className="text-sm font-medium">{currentLangInfo.nativeName}</span>
        )}
      </button>

      {/* Language Selection Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="language-selector-title"
        >
          <div
            ref={modalRef}
            className="w-full max-w-sm rounded-xl p-6 shadow-2xl"
            style={{ backgroundColor: '#FFFFFF' }}
          >
            {/* Title */}
            <div className="flex items-center justify-between mb-6">
              <h2 id="language-selector-title" className="text-xl font-semibold" style={{ color: '#212121' }}>
                {t('language.selectLanguage')}
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                aria-label={t('common.close')}
                className="tap-target p-2 rounded-lg hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            {/* Current Language Info */}
            <div
              className="mb-4 p-3 rounded-lg"
              style={{ backgroundColor: '#E8F5E8', borderColor: '#2E7D32', borderWidth: '1px' }}
            >
              <p className="text-sm" style={{ color: '#2E7D32' }}>
                {t('language.currentLanguage', { language: currentLangInfo.nativeName })}
              </p>
            </div>

            {/* Language List */}
            <div className="space-y-2">
              {availableLanguages.map((lang) => {
                const isSelected = lang.code === currentLanguage;
                
                return (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`w-full flex items-center justify-between p-4 rounded-lg transition-colors tap-target ${
                      isSelected ? 'bg-green-50' : 'hover:bg-gray-50'
                    }`}
                    style={{
                      borderWidth: '1px',
                      borderColor: isSelected ? '#2E7D32' : '#E0E0E0',
                      minHeight: '60px'
                    }}
                    aria-pressed={isSelected}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl" role="img" aria-label={`${lang.name} flag`}>
                        {lang.flag}
                      </span>
                      <div className="text-left">
                        <p className="font-medium" style={{ color: '#212121' }}>
                          {lang.nativeName}
                        </p>
                        <p className="text-sm" style={{ color: '#9E9E9E' }}>
                          {lang.name}
                        </p>
                      </div>
                    </div>
                    {isSelected && (
                      <Check 
                        className="w-5 h-5" 
                        style={{ color: '#2E7D32' }} 
                        aria-hidden="true"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Info about future languages */}
            <div
              className="mt-6 p-3 rounded-lg text-sm"
              style={{ backgroundColor: '#F5F5F5', color: '#616161' }}
            >
              <p>
                🌍 More languages coming soon: Punjabi, Tamil, Telugu, Bengali, Marathi, and more!
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LanguageSelector;
