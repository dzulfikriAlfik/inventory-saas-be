import swaggerJSDoc from "swagger-jsdoc";
import { env } from "./env";

export const openApiSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Inventory SaaS API",
      version: "0.1.0",
      description: "Inventory SaaS MVP backend API"
    },
    servers: [
      {
        url:
          env.NODE_ENV === "production"
            ? "https://inventory-be.pintarware.com"
            : `http://localhost:${env.PORT}`
      }
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "accessToken"
        }
      }
    }
  },
  apis: ["src/modules/**/*.ts"]
});
