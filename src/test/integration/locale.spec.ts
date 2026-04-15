import request from "supertest";
import { HttpHeader } from "../../constants/http-header";
import { I18nKey } from "../../constants/i18n-key";
import { app } from "../../app";
import commonEn from "../../locales/en/common.json";
import commonId from "../../locales/id/common.json";

/**
 * Resolves a dotted i18n key against a locale bundle (namespace `common` root object).
 *
 * @param bundle Loaded locale JSON.
 * @param dottedKey Key such as `errors.auth.missingAccessToken`.
 * @returns Translated string.
 */
const messageAt = (bundle: typeof commonEn, dottedKey: string): string => {
  const parts = dottedKey.split(".");
  let current: unknown = bundle;
  for (const part of parts) {
    if (current === null || typeof current !== "object" || !(part in current)) {
      throw new Error(`Missing key ${dottedKey}`);
    }
    current = (current as Record<string, unknown>)[part];
  }
  return String(current);
};

describe("Localization", () => {
  it("returns translated error when Accept-Language is id", async () => {
    const response = await request(app)
      .get("/auth/me")
      .set(HttpHeader.AcceptLanguage, "id");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe(messageAt(commonId, I18nKey.Errors.Auth.MissingAccessToken));
  });

  it("returns English error by default", async () => {
    const response = await request(app).get("/auth/me");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe(messageAt(commonEn, I18nKey.Errors.Auth.MissingAccessToken));
  });
});
