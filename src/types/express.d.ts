import type { Role } from "@prisma/client";
import type { TFunction } from "i18next";

/**
 * Augments Express `Request` with auth context and i18next `t`.
 */
declare global {
  namespace Express {
    interface Request {
      /** Populated by {@link authMiddleware} when the access cookie is valid. */
      auth?: {
        userId: string;
        organizationId: string;
        role: Role;
      };
      /** Bound i18n translate function (namespace `common`). */
      t: TFunction;
    }
  }
}

export {};
