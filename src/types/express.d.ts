import type { Role } from "@prisma/client";
import type { TFunction } from "i18next";

declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        organizationId: string;
        role: Role;
      };
      t: TFunction;
    }
  }
}

export {};
