import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface Language {
  code: string;
  name: string;
  flag: string;
}

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const languages: Language[] = [
    { code: 'ca', name: 'Català', flag: '🏴' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'ro', name: 'Română', flag: '🇷🇴' },
    { code: 'uk', name: 'Українська', flag: '🇺🇦' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  // Calculate dropdown position and close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const calculatePosition = () => {
      if (buttonRef.current && isOpen) {
        const buttonRect = buttonRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const dropdownHeight = 200; // Approximate height of dropdown
        
        // If there's not enough space below, position above
        if (buttonRect.bottom + dropdownHeight > viewportHeight && buttonRect.top > dropdownHeight) {
          setDropdownPosition('top');
        } else {
          setDropdownPosition('bottom');
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      calculatePosition();
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef} data-testid="language-switcher">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-200"
      >
        <span className="text-lg">{currentLanguage.flag}</span>
        <span>{currentLanguage.name}</span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className={`absolute left-0 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200 ${
          dropdownPosition === 'top' 
            ? 'bottom-full mb-1' 
            : 'top-full mt-1'
        }`}>
          <div className="py-1">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`w-full flex items-center space-x-3 px-4 py-2 text-sm transition-colors duration-200 ${
                  language.code === i18n.language
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-lg">{language.flag}</span>
                <span>{language.name}</span>
                {language.code === i18n.language && (
                  <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
