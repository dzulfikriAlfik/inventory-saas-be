import { ApiPath, OpenApiPath } from "../constants/api-path";
import { CookieName } from "../constants/cookie-name";
import { HealthStatus } from "../constants/health";
import { OpenApiMeta } from "../constants/openapi-meta";
import { OpenApiTag } from "../constants/openapi-tag";
import { PublicUrl } from "../constants/public-url";
import { env } from "./env";

/**
 * Builds the OpenAPI 3 document for Swagger UI without `swagger-jsdoc`
 * (avoids deprecated `url.parse()` usage inside transitive parsers).
 *
 * @returns OpenAPI specification object consumed by `swagger-ui-express`.
 */
export function buildOpenApiSpec(): Record<string, unknown> {
  const serverUrl =
    env.NODE_ENV === "production"
      ? PublicUrl.BackendProductionBase
      : `http://localhost:${String(env.PORT)}`;

  return {
    openapi: OpenApiMeta.OpenApiVersion,
    info: {
      title: OpenApiMeta.Title,
      version: OpenApiMeta.Version,
      description: OpenApiMeta.Description
    },
    servers: [{ url: serverUrl }],
    paths: {
      [ApiPath.Health]: {
        get: {
          tags: [OpenApiTag.Health],
          summary: "Service health check",
          responses: {
            "200": {
              description: "Service is healthy",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: { type: "string", enum: [HealthStatus.Ok] }
                    }
                  }
                }
              }
            }
          }
        }
      },
      [ApiPath.AuthRegister]: {
        post: {
          tags: [OpenApiTag.Auth],
          summary: "Register a user and organization",
          responses: {
            "201": { description: "Registered successfully" }
          }
        }
      },
      [ApiPath.AuthLogin]: {
        post: {
          tags: [OpenApiTag.Auth],
          summary: "Login with email and password",
          responses: {
            "200": { description: "Login successful" }
          }
        }
      },
      [ApiPath.AuthRefresh]: {
        post: {
          tags: [OpenApiTag.Auth],
          summary: "Refresh access token",
          responses: {
            "200": { description: "Token refreshed" }
          }
        }
      },
      [ApiPath.AuthLogout]: {
        post: {
          tags: [OpenApiTag.Auth],
          summary: "Logout current session",
          responses: {
            "200": { description: "Logout successful" }
          }
        }
      },
      [ApiPath.AuthMe]: {
        get: {
          tags: [OpenApiTag.Auth],
          summary: "Get current authenticated user",
          security: [{ cookieAuth: [] }],
          responses: {
            "200": { description: "Current user context" }
          }
        }
      },
      [ApiPath.OrganizationsCurrent]: {
        get: {
          tags: [OpenApiTag.Organizations],
          summary: "Get active organization from auth context",
          security: [{ cookieAuth: [] }],
          responses: {
            "200": { description: "Current organization" }
          }
        }
      },
      [ApiPath.MembersRoot]: {
        get: {
          tags: [OpenApiTag.Members],
          summary: "List members in current organization",
          security: [{ cookieAuth: [] }],
          responses: {
            "200": { description: "Members list" }
          }
        }
      },
      [OpenApiPath.MembersRoleById]: {
        patch: {
          tags: [OpenApiTag.Members],
          summary: "Update membership role",
          security: [{ cookieAuth: [] }],
          responses: {
            "204": { description: "Role updated" }
          }
        }
      }
    },
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: CookieName.AccessToken
        }
      }
    }
  };
}
