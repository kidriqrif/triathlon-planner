import React, { createContext, useContext, useState } from 'react'
import translations from './translations'

const I18nContext = createContext()

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('strelo_lang') || 'en')

  const changeLang = (newLang) => {
    setLang(newLang)
    localStorage.setItem('strelo_lang', newLang)
  }

  const t = (key) => {
    return translations[lang]?.[key] || translations.en[key] || key
  }

  return (
    <I18nContext.Provider value={{ lang, setLang: changeLang, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  return useContext(I18nContext)
}
