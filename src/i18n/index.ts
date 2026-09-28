import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enUS from './locales/en-US.json';
import zhCN from './locales/zh-CN.json';

i18n.use(initReactI18next).init({
  resources: {
    zh: { translation: zhCN },
    en: { translation: enUS },
  },
  lng: localStorage.getItem('lang') || 'zh', // 默认语言
  fallbackLng: 'zh',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
