import { type Role } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { HttpStatus } from "../../constants/http-status";
import { I18nKey } from "../../constants/i18n-key";
import { ApiError } from "../../utils/api-error";

/**
 * Membership listing and role updates within the current organization.
 */
export class MembersService {
  /**
   * Lists non-deleted memberships with basic user profile fields.
   *
   * @param organizationId Tenant id from JWT.
   * @returns Membership rows for the organization.
   */
  async list(organizationId: string): Promise<
    Array<{
      id: string;
      role: Role;
      user: {
        id: string;
        email: string;
        fullName: string;
      };
    }>
  > {
    const memberships = await prisma.membership.findMany({
      where: {
        organizationId,
        deletedAt: null
      },
      include: {
        user: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return memberships.map((membership) => ({
      id: membership.id,
      role: membership.role,
      user: {
        id: membership.user.id,
        email: membership.user.email,
        fullName: membership.user.fullName
      }
    }));
  }

  /**
   * Updates a membership role when the row belongs to the same organization.
   *
   * @param organizationId Tenant id from JWT.
   * @param membershipId Membership primary key.
   * @param role New role value.
   */
  async updateRole(organizationId: string, membershipId: string, role: Role): Promise<void> {
    const membership = await prisma.membership.findFirst({
      where: {
        id: membershipId,
        organizationId,
        deletedAt: null
      }
    });
    if (!membership) {
      throw new ApiError(HttpStatus.NotFound, I18nKey.Errors.Membership.NotFound);
    }

    await prisma.membership.update({
      where: { id: membership.id },
      data: { role }
    });
  }
}
