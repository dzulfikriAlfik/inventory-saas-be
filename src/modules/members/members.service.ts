import { type Role } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/api-error";

export class MembersService {
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

  async updateRole(organizationId: string, membershipId: string, role: Role): Promise<void> {
    const membership = await prisma.membership.findFirst({
      where: {
        id: membershipId,
        organizationId,
        deletedAt: null
      }
    });
    if (!membership) {
      throw new ApiError(404, "errors.membership.notFound");
    }

    await prisma.membership.update({
      where: { id: membership.id },
      data: { role }
    });
  }
}
