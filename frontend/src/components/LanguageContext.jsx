'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import mr from '../locales/mr.json';
import en from '../locales/en.json';

const translations = { mr, en };

const LanguageContext = createContext({
  locale: 'mr',
  setLocale: () => {},
  toggleLocale: () => {},
  t: (key) => key,
  getLocalized: (obj, field) => '',
  isMarathi: true,
  isEnglish: false,
});

export function LanguageProvider({ children }) {
  const [locale, setLocaleState] = useState('mr');
  const [mounted, setMounted] = useState(false);

  // Restore saved locale safely on client mount
  useEffect(() => {
    setMounted(true);
    try {
      const savedLocale = localStorage.getItem('chanda_locale');
      if (savedLocale === 'mr' || savedLocale === 'en') {
        setLocaleState(savedLocale);
        document.documentElement.lang = savedLocale;
      } else {
        document.documentElement.lang = 'mr';
      }
    } catch {
      // Ignore localStorage access failures
    }
  }, []);

  const setLocale = useCallback((newLocale) => {
    if (newLocale !== 'mr' && newLocale !== 'en') return;
    setLocaleState(newLocale);
    try {
      localStorage.setItem('chanda_locale', newLocale);
      document.documentElement.lang = newLocale;
    } catch {}
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale((prev) => (prev === 'mr' ? 'en' : 'mr'));
  }, [setLocale]);

  /**
   * Safe nested key lookup (e.g. t('portal.title')) with automatic fallback
   */
  const t = useCallback(
    (path) => {
      if (!path) return '';
      const keys = path.split('.');
      let current = translations[locale];

      for (const key of keys) {
        if (!current || current[key] === undefined) {
          // Fallback to Marathi if key missing in selected language
          let fallback = translations.mr;
          for (const fbKey of keys) {
            if (!fallback || fallback[fbKey] === undefined) return path;
            fallback = fallback[fbKey];
          }
          return fallback;
        }
        current = current[key];
      }

      return current;
    },
    [locale]
  );

  /**
   * Helper to retrieve bilingual object properties (e.g., nameMr/nameEn, titleMr/titleEn)
   * Example: getLocalized(taluka, 'name') -> returns taluka.nameMr or taluka.nameEn
   */
  const getLocalized = useCallback(
    (obj, field) => {
      if (!obj) return '';
      const suffix = locale === 'mr' ? 'Mr' : 'En';
      const altSuffix = locale === 'mr' ? 'En' : 'Mr';

      if (obj[`${field}${suffix}`] !== undefined) {
        return obj[`${field}${suffix}`];
      }
      if (obj[`${field}${altSuffix}`] !== undefined) {
        return obj[`${field}${altSuffix}`];
      }
      return obj[field] || '';
    },
    [locale]
  );

  const value = {
    locale,
    setLocale,
    toggleLocale,
    t,
    getLocalized,
    isMarathi: locale === 'mr',
    isEnglish: locale === 'en',
    mounted,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export const useTranslation = () => useContext(LanguageContext);
