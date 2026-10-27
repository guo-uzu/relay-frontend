import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { en } from './locales/en'
import { es } from './locales/es'

const saved = localStorage.getItem('lang')
const lng = saved === 'es' || saved === 'en' ? saved : navigator.language.startsWith('es') ? 'es' : 'en'
document.documentElement.lang = lng

void i18n.use(initReactI18next).init({
  lng,
  fallbackLng: 'en',
  resources: { en: { translation: en }, es: { translation: es } },
  keySeparator: false,
  interpolation: { escapeValue: false },
})

export const setLang = (l: 'en' | 'es') => {
  localStorage.setItem('lang', l)
  document.documentElement.lang = l
  void i18n.changeLanguage(l)
}

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: { translation: typeof en }
  }
}
