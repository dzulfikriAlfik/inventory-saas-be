/**
 * Supported UI/API locales and i18next wiring.
 */
export const I18nLocale = {
  English: "en",
  Indonesian: "id"
} as const;

export type SupportedLocale = (typeof I18nLocale)[keyof typeof I18nLocale];

/**
 * Query string and cookie name used to override locale (`?lng=` / `lng` cookie).
 */
export const I18nOverrideParam = "lng";

export const I18nNamespace = {
  Common: "common"
} as const;
