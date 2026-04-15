/**
 * i18n translation keys for namespace `common`.
 * Keep in sync with `src/locales` English and Indonesian `common.json` files.
 */
export const I18nKey = {
  Errors: {
    Internal: "errors.internal",
    Auth: {
      MissingAccessToken: "errors.auth.missingAccessToken",
      InvalidAccessToken: "errors.auth.invalidAccessToken",
      MissingRefreshToken: "errors.auth.missingRefreshToken",
      InvalidRefreshSession: "errors.auth.invalidRefreshSession",
      AuthenticationRequired: "errors.auth.authenticationRequired",
      AuthenticationIsRequired: "errors.auth.authenticationIsRequired",
      InvalidCredentials: "errors.auth.invalidCredentials",
      EmailAlreadyRegistered: "errors.auth.emailAlreadyRegistered",
      NoActiveMembership: "errors.auth.noActiveMembership"
    },
    Organization: {
      ContextRequired: "errors.organization.contextRequired",
      NotFound: "errors.organization.notFound"
    },
    Membership: {
      NotFound: "errors.membership.notFound"
    },
    Rbac: {
      Forbidden: "errors.rbac.forbidden"
    },
    Validation: {
      InvalidBody: "errors.validation.invalidBody",
      InvalidParams: "errors.validation.invalidParams",
      InvalidQuery: "errors.validation.invalidQuery"
    }
  },
  Messages: {
    Auth: {
      Registered: "messages.auth.registered",
      LoginSuccess: "messages.auth.loginSuccess",
      TokenRefreshed: "messages.auth.tokenRefreshed",
      LogoutSuccess: "messages.auth.logoutSuccess"
    }
  }
} as const;
