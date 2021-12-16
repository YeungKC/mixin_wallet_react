import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import cn from "./locales/zh-cn.json"
import en from "./locales/en-us.json"
import localizedFormat from "dayjs/plugin/localizedFormat"
import dayjs from "dayjs"
import "dayjs/locale/zh-cn"
import "dayjs/locale/en"

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
    fallbackLng: "en",
    detection: {
      order: [
        "querystring",
        "cookie",
        "sessionStorage",
        "localStorage",
        "navigator",
        "htmlTag",
      ],
      caches: ["localStorage", "sessionStorage", "cookie"],
      lookupQuerystring: "lang",
      lookupCookie: "lang",
      lookupLocalStorage: "lang",
      lookupSessionStorage: "lang",
    },
  })

dayjs.extend(localizedFormat)
dayjs.locale(i18n.language.toLocaleLowerCase())

export default i18n
