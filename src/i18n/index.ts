import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import vi from './locales/vi.json';
import en from './locales/en.json';

const LANGUAGE_KEY = '@block-blast:language';

const resources = {
  vi: { translation: vi },
  en: { translation: en },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'vi', // Ngôn ngữ mặc định ban đầu
    fallbackLng: 'vi',
    interpolation: {
      escapeValue: false,
    },
  });

// Tải ngôn ngữ đã lưu trên bộ nhớ thiết bị
AsyncStorage.getItem(LANGUAGE_KEY)
  .then((savedLang) => {
    if (savedLang === 'vi' || savedLang === 'en') {
      i18n.changeLanguage(savedLang);
    }
  })
  .catch((err) => console.warn('Failed to load saved language:', err));

export const changeLanguage = async (lng: 'vi' | 'en') => {
  try {
    await i18n.changeLanguage(lng);
    await AsyncStorage.setItem(LANGUAGE_KEY, lng);
  } catch (e) {
    console.warn('Failed to save selected language:', e);
  }
};

export default i18n;
