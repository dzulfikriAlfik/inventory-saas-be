import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/api-error";

export class OrganizationsService {
  async getCurrentOrganization(organizationId: string): Promise<{
    id: string;
    name: string;
    slug: string;
  }> {
    const organization = await prisma.organization.findFirst({
      where: {
        id: organizationId,
        deletedAt: null
      }
    });
    if (!organization) {
      throw new ApiError(404, "errors.organization.notFound");
    }

    return {
      id: organization.id,
      name: organization.name,
      slug: organization.slug
    };
  }
}
