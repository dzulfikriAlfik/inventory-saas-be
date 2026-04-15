import { Role } from "@prisma/client";

/**
 * Roles allowed to list or change membership roles (RBAC for `/members` writes).
 */
export const MembershipManagementRoles = [Role.OWNER, Role.ADMIN] as const;
