import i18next from "i18next";
import * as middleware from "i18next-http-middleware";
import commonEn from "../locales/en/common.json";
import commonId from "../locales/id/common.json";

void i18next.use(middleware.LanguageDetector).init({
  fallbackLng: "en",
  supportedLngs: ["en", "id"],
  ns: ["common"],
  defaultNS: "common",
  resources: {
    en: { common: commonEn },
    id: { common: commonId }
  },
  detection: {
    order: ["querystring", "header", "cookie"],
    lookupQuerystring: "lng",
    lookupCookie: "lng",
    caches: ["cookie"]
  },
  interpolation: {
    escapeValue: false
  }
});

export const i18n = i18next;
export const localeMiddleware = middleware.handle(i18next);
