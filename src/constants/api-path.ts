/**
 * URL path segments and composed API paths (leading slash).
 */
export const ApiSegment = {
  Health: "health",
  Auth: "auth",
  Organizations: "organizations",
  Members: "members",
  Current: "current",
  Register: "register",
  Login: "login",
  Refresh: "refresh",
  Logout: "logout",
  Me: "me",
  Role: "role"
} as const;

/**
 * Composed paths relative to the server origin (no API version prefix).
 */
export const ApiPath = {
  Health: `/${ApiSegment.Health}`,
  AuthRegister: `/${ApiSegment.Auth}/${ApiSegment.Register}`,
  AuthLogin: `/${ApiSegment.Auth}/${ApiSegment.Login}`,
  AuthRefresh: `/${ApiSegment.Auth}/${ApiSegment.Refresh}`,
  AuthLogout: `/${ApiSegment.Auth}/${ApiSegment.Logout}`,
  AuthMe: `/${ApiSegment.Auth}/${ApiSegment.Me}`,
  OrganizationsCurrent: `/${ApiSegment.Organizations}/${ApiSegment.Current}`,
  MembersRoot: `/${ApiSegment.Members}`
} as const;

/**
 * Express `Router` mount prefixes (no leading slash).
 */
export const ApiMount = {
  Auth: ApiSegment.Auth,
  Organizations: ApiSegment.Organizations,
  Members: ApiSegment.Members
} as const;

/**
 * Paths relative to a feature router (mounted under {@link ApiMount}).
 */
export const AuthRouteTemplate = {
  Register: `/${ApiSegment.Register}`,
  Login: `/${ApiSegment.Login}`,
  Refresh: `/${ApiSegment.Refresh}`,
  Logout: `/${ApiSegment.Logout}`,
  Me: `/${ApiSegment.Me}`
} as const;

export const OrganizationRouteTemplate = {
  Current: `/${ApiSegment.Current}`
} as const;

export const MembersRouteTemplate = {
  List: "/",
  RoleById: `/:id/${ApiSegment.Role}`
} as const;

/**
 * OpenAPI path templates (`{param}`) may differ from Express route patterns (`:param`).
 */
export const OpenApiPath = {
  MembersRoleById: "/members/{id}/role"
} as const;
