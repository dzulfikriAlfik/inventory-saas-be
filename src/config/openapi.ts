import { buildOpenApiSpec } from "./openapi-definition";

/**
 * OpenAPI document served at `/docs` (built statically; no `swagger-jsdoc` runtime parse).
 */
export const openApiSpec = buildOpenApiSpec();
