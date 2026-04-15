import i18next from "i18next";
import * as middleware from "i18next-http-middleware";
import { I18nLocale, I18nNamespace, I18nOverrideParam } from "../constants/i18n-locale";
import commonEn from "../locales/en/common.json";
import commonId from "../locales/id/common.json";

i18next.use(middleware.LanguageDetector).init({
  fallbackLng: I18nLocale.English,
  supportedLngs: [I18nLocale.English, I18nLocale.Indonesian],
  ns: [I18nNamespace.Common],
  defaultNS: I18nNamespace.Common,
  resources: {
    [I18nLocale.English]: { [I18nNamespace.Common]: commonEn },
    [I18nLocale.Indonesian]: { [I18nNamespace.Common]: commonId }
  },
  detection: {
    order: ["querystring", "header", "cookie"],
    lookupQuerystring: I18nOverrideParam,
    lookupCookie: I18nOverrideParam,
    caches: ["cookie"]
  },
  interpolation: {
    escapeValue: false
  }
});

/**
 * Shared i18next instance (namespace `common` bundles API messages).
 */
export const i18n = i18next;

/**
 * Express middleware: attaches `req.t` and resolves locale per request.
 */
export const localeMiddleware = middleware.handle(i18next);
