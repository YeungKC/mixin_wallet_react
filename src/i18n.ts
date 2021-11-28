import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import cn from './locales/zh-cn.json'
import en from './locales/en-us.json'

const resources = {
  zh: {
    translation: cn,
  },
  en: {
    translation: en,
  },
}
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    detection: {
      order: ['querystring', 'cookie', 'sessionStorage', 'localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage', 'sessionStorage', 'cookie'],
      lookupQuerystring: 'lang',
      lookupCookie: 'lang',
      lookupLocalStorage: 'lang',
      lookupSessionStorage: 'lang',
    },
  })

export default i18n
